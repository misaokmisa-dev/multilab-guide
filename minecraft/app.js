(() => {
  'use strict';
  const quiz = document.getElementById('quiz');
  if (!quiz) return;
  const steps = [...quiz.querySelectorAll('.quiz-step')];
  const next = document.getElementById('next');
  const back = document.getElementById('back');
  const error = document.getElementById('quiz-error');
  const result = document.getElementById('result');
  const progress = document.getElementById('progress-track');
  const progressFill = document.getElementById('progress-fill');
  const percent = document.getElementById('progress-percent');
  const stepLabel = document.getElementById('step-label');
  const restart = document.getElementById('restart');
  const offer = document.getElementById('offer-link');
  const fallbackUrl = 'https://game.conoha.jp/function/minecraft/';
  const affiliateUrl = typeof window.AFFILIATE_URL === 'string' ? window.AFFILIATE_URL.trim() : '';
  const hasAffiliate = /^https:\/\//i.test(affiliateUrl);
  const linkState = document.getElementById('link-state');
  let current = 0;
  let started = false;

  // Data-layer hooks do not send data anywhere. Analytics can subscribe later with consent.
  const metric = (name, data = {}) => {
    try {
      window.dispatchEvent(new CustomEvent('multilab:interaction', { detail: { name, ...data } }));
    } catch (_) { /* measurement is optional */ }
  };

  const selected = name => quiz.querySelector(`input[name="${name}"]:checked`)?.value;
  function setProgress(n, text) {
    progress.setAttribute('aria-valuenow', String(n));
    progressFill.style.width = `${n}%`;
    percent.textContent = `${n}%`;
    stepLabel.textContent = text;
  }
  function showStep(i, focus = false) {
    current = i;
    steps.forEach((step, j) => { step.hidden = i !== j; });
    back.disabled = i === 0;
    next.textContent = i === steps.length - 1 ? '診断結果を見る →' : '次へ →';
    next.disabled = !steps[i].querySelector('input:checked');
    error.hidden = true;
    setProgress(Math.round((i + 1) / steps.length * 100), `質問 ${i + 1} / ${steps.length}`);
    if (focus) steps[i].querySelector('legend')?.setAttribute('tabindex', '-1');
    if (focus) steps[i].querySelector('legend')?.focus({ preventScroll: true });
    if (focus) document.getElementById('diagnosis').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function showResult() {
    const edition = selected('edition');
    const players = Number(selected('players'));
    const mods = selected('mods');
    const duration = selected('duration');
    let gb = players <= 4 ? 2 : players <= 10 ? 4 : players <= 20 ? 8 : 16;
    const warnings = [];
    if (mods === 'light') { gb = Math.max(gb, 4); warnings.push('追加要素の種類・数によって負荷が増えるため、余裕のある構成とCPU性能も検討してください。'); }
    if (mods === 'heavy') { gb = Math.max(gb, 8); warnings.push('大型MODパックはこの人数表だけで容量を確定できません。配布元の推奨RAM・CPU要件を優先してください。'); }
    if (players > 20) warnings.push('21人以上は負荷の差が大きいため、実測や専門的な確認が必要です。');
    const editionText = edition === 'java' ? 'Java版' : '統合版';
    const playerText = players <= 4 ? '2〜4人' : players <= 10 ? '5〜10人' : players <= 20 ? '11〜20人' : '21人以上';
    const isEstimate = mods === 'heavy' || players > 20;
    document.getElementById('result-size').textContent = `${gb}GB${isEstimate ? '以上' : ''}`;
    document.getElementById('result-suffix').textContent = isEstimate ? 'を個別に検証' : 'から検討';
    document.getElementById('result-reason').textContent = `${editionText}・${playerText}・${mods === 'none' ? '追加要素ほぼなし' : mods === 'light' ? '追加要素少量' : '大型MODあり'}の条件に基づく暫定的な目安です。契約時は${editionText}に対応する構成を選んでください。`;
    document.getElementById('result-advice').textContent = warnings.join(' ') || '実際の必要容量はワールド・MOD・ゲームバージョン・CPUなどで変わります。性能を保証するものではありません。';
    const durationInfo = {
      brief: '数日だけなら、時間課金と月額契約の総額を比較。停止中も課金されるかなどの条件を確認してください。',
      month: '1か月パスと時間課金の総額を比較。更新条件や解約手順も確認してください。',
      long: '3か月以上なら長期割引パスも候補。ただし前払いと途中解約の条件を確認してください。'
    };
    document.getElementById('result-duration').textContent = durationInfo[duration];
    if (hasAffiliate) {
      offer.href = affiliateUrl;
      offer.rel = 'noopener noreferrer sponsored';
      linkState.textContent = 'PR：このリンクから申し込むと当サイトが報酬を受け取る場合があります。最新料金・条件はリンク先でご確認ください。';
      document.getElementById('ad-notice').hidden = false;
    } else {
      offer.href = fallbackUrl;
      offer.rel = 'noopener noreferrer';
      linkState.textContent = '現在は公式サイトへの通常リンクです。広告提携後に必要な表示とともに切り替えます。';
    }
    quiz.hidden = true;
    result.hidden = false;
    setProgress(100, '診断完了');
    metric('diagnosis_complete', { edition, players: playerText, mods, duration, gb });
    result.setAttribute('tabindex', '-1');
    result.focus({ preventScroll: true });
  }
  quiz.addEventListener('change', e => {
    if (!(e.target instanceof HTMLInputElement)) return;
    next.disabled = false;
    error.hidden = true;
    if (!started) { started = true; metric('diagnosis_start'); }
    metric('diagnosis_answer', { step: current + 1 });
  });
  next.addEventListener('click', () => {
    if (!steps[current].querySelector('input:checked')) { error.hidden = false; return; }
    current === steps.length - 1 ? showResult() : showStep(current + 1, true);
  });
  back.addEventListener('click', () => { if (current > 0) showStep(current - 1, true); });
  restart.addEventListener('click', () => {
    quiz.reset(); result.hidden = true; quiz.hidden = false; started = false; showStep(0, true); metric('diagnosis_restart');
  });
  offer.addEventListener('click', () => metric('offer_click', { sponsored: hasAffiliate }));
  const sticky = document.getElementById('mobile-action');
  const hero = document.getElementById('diagnosis');
  if (sticky && hero && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      const visible = entries[0].isIntersecting;
      sticky.hidden = visible;
    }, { threshold: 0.05 });
    observer.observe(hero);
    sticky.hidden = true;
  }
  showStep(0);
})();