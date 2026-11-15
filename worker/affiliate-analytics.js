/*
  MULTI LAB GUIDE: first-party, cookie-free affiliate-event collection.
  Secret MLG_ADMIN_TOKEN is required for private reporting.
  No visitor identifiers, IP addresses or query strings are stored.
*/
const DATASET = 'events.analyticsEngine.mlg_site_events';
// Publish one genuinely useful browser, not 1,672 generic articles.
// These slugs are derived from the Minecraft item dataset; unknown paths remain 404.
const VALID_ITEM_SLUGS=new Set("abandoned_camp_map|acacia_boat|acacia_button|acacia_chest_boat|acacia_door|acacia_fence|acacia_fence_gate|acacia_hanging_sign|acacia_leaves|acacia_log|acacia_planks|acacia_pressure_plate|acacia_sapling|acacia_shelf|acacia_sign|acacia_slab|acacia_stairs|acacia_trapdoor|acacia_wood|activator_rail|allay_spawn_egg|allium|amethyst_block|amethyst_cluster|amethyst_shard|ancient_debris|andesite|andesite_slab|andesite_stairs|andesite_wall|angler_pottery_sherd|anvil|apple|archer_pottery_sherd|armadillo_scute|armadillo_spawn_egg|armor_stand|arms_up_pottery_sherd|arrow|axolotl_bucket|axolotl_spawn_egg|azalea|azalea_leaves|azure_bluet|baked_potato|bamboo|bamboo_block|bamboo_button|bamboo_chest_raft|bamboo_door|bamboo_fence|bamboo_fence_gate|bamboo_hanging_sign|bamboo_mosaic|bamboo_mosaic_slab|bamboo_mosaic_stairs|bamboo_planks|bamboo_pressure_plate|bamboo_raft|bamboo_shelf|bamboo_sign|bamboo_slab|bamboo_stairs|bamboo_trapdoor|barrel|barrier|basalt|bat_spawn_egg|beacon|bedrock|bee_nest|bee_spawn_egg|beef|beehive|beetroot|beetroot_seeds|beetroot_soup|bell|big_dripleaf|birch_boat|birch_button|birch_chest_boat|birch_door|birch_fence|birch_fence_gate|birch_hanging_sign|birch_leaves|birch_log|birch_planks|birch_pressure_plate|birch_sapling|birch_shelf|birch_sign|birch_slab|birch_stairs|birch_trapdoor|birch_wood|black_banner|black_bed|black_bundle|black_candle|black_carpet|black_concrete|black_concrete_powder|black_concrete_slab|black_concrete_stairs|black_cushion|black_dye|black_glazed_terracotta|black_harness|black_shulker_box|black_stained_glass|black_stained_glass_pane|black_terracotta|black_wool|black_wool_slab|black_wool_stairs|blackstone|blackstone_slab|blackstone_stairs|blackstone_wall|blade_pottery_sherd|blast_furnace|blaze_powder|blaze_rod|blaze_spawn_egg|blue_banner|blue_bed|blue_bundle|blue_candle|blue_carpet|blue_concrete|blue_concrete_powder|blue_concrete_slab|blue_concrete_stairs|blue_cushion|blue_dye|blue_egg|blue_glazed_terracotta|blue_harness|blue_ice|blue_orchid|blue_shulker_box|blue_stained_glass|blue_stained_glass_pane|blue_terracotta|blue_wool|blue_wool_slab|blue_wool_stairs|bogged_spawn_egg|bolt_armor_trim_smithing_template|bone|bone_block|bone_meal|book|bookshelf|bordure_indented_banner_pattern|bow|bowl|brain_coral|brain_coral_block|brain_coral_fan|bread|breeze_rod|breeze_spawn_egg|brewer_pottery_sherd|brewing_stand|brick|brick_slab|brick_stairs|brick_wall|bricks|brittle_ice|brown_banner|brown_bed|brown_bundle|brown_candle|brown_carpet|brown_concrete|brown_concrete_powder|brown_concrete_slab|brown_concrete_stairs|brown_cushion|brown_dye|brown_egg|brown_glazed_terracotta|brown_harness|brown_mushroom|brown_mushroom_block|brown_shulker_box|brown_stained_glass|brown_stained_glass_pane|brown_terracotta|brown_wool|brown_wool_slab|brown_wool_stairs|brush|bubble_coral|bubble_coral_block|bubble_coral_fan|bucket|budding_amethyst|bundle|buried_ancient_city_map|buried_mineshaft_map|buried_treasure_map|buried_trial_chambers_map|burn_pottery_sherd|bush|cactus|cactus_flower|cake|calcite|calibrated_sculk_sensor|camel_husk_spawn_egg|camel_spawn_egg|campfire|candle|carrot|carrot_on_a_stick|cartography_table|carved_pumpkin|cat_spawn_egg|cauldron|cave_spider_spawn_egg|chain_command_block|chainmail_boots|chainmail_chestplate|chainmail_helmet|chainmail_leggings|charcoal|cherry_boat|cherry_button|cherry_chest_boat|cherry_door|cherry_fence|cherry_fence_gate|cherry_hanging_sign|cherry_leaves|cherry_log|cherry_planks|cherry_pressure_plate|cherry_sapling|cherry_shelf|cherry_sign|cherry_slab|cherry_stairs|cherry_trapdoor|cherry_wood|chest|chest_minecart|chicken|chicken_spawn_egg|chipped_anvil|chiseled_bookshelf|chiseled_cinnabar|chiseled_copper|chiseled_deepslate|chiseled_nether_bricks|chiseled_packed_ice|chiseled_polished_blackstone|chiseled_quartz_block|chiseled_red_sandstone|chiseled_resin_bricks|chiseled_sandstone|chiseled_stone_bricks|chiseled_sulfur|chiseled_tuff|chiseled_tuff_bricks|chorus_flower|chorus_fruit|chorus_plant|cinnabar|cinnabar_brick_slab|cinnabar_brick_stairs|cinnabar_brick_wall|cinnabar_bricks|cinnabar_slab|cinnabar_stairs|cinnabar_wall|clay|clay_ball|clock|closed_eyeblossom|coal|coal_block|coal_ore|coarse_dirt|coast_armor_trim_smithing_template|cobbled_deepslate|cobbled_deepslate_slab|cobbled_deepslate_stairs|cobbled_deepslate_wall|cobblestone|cobblestone_slab|cobblestone_stairs|cobblestone_wall|cobweb|cocoa_beans|cod|cod_bucket|cod_spawn_egg|command_block|command_block_minecart|comparator|compass|composter|conduit|cooked_beef|cooked_chicken|cooked_cod|cooked_mutton|cooked_porkchop|cooked_rabbit|cooked_salmon|cookie|copper_axe|copper_bars|copper_block|copper_boots|copper_bulb|copper_chain|copper_chest|copper_chestplate|copper_door|copper_golem_spawn_egg|copper_golem_statue|copper_grate|copper_helmet|copper_hoe|copper_horse_armor|copper_ingot|copper_lantern|copper_leggings|copper_nautilus_armor|copper_nugget|copper_ore|copper_pickaxe|copper_shovel|copper_spear|copper_sword|copper_torch|copper_trapdoor|cornflower|cow_spawn_egg|cracked_deepslate_bricks|cracked_deepslate_tiles|cracked_nether_bricks|cracked_polished_blackstone_bricks|cracked_stone_bricks|crafter|crafting_table|creaking_heart|creaking_spawn_egg|creeper_banner_pattern|creeper_head|creeper_spawn_egg|crimson_button|crimson_door|crimson_fence|crimson_fence_gate|crimson_fungus|crimson_hanging_sign|crimson_hyphae|crimson_nylium|crimson_planks|crimson_pressure_plate|crimson_roots|crimson_shelf|crimson_sign|crimson_slab|crimson_stairs|crimson_stem|crimson_trapdoor|crossbow|crying_obsidian|cut_copper|cut_copper_slab|cut_copper_stairs|cut_red_sandstone|cut_red_sandstone_slab|cut_sandstone|cut_sandstone_slab|cyan_banner|cyan_bed|cyan_bundle|cyan_candle|cyan_carpet|cyan_concrete|cyan_concrete_powder|cyan_concrete_slab|cyan_concrete_stairs|cyan_cushion|cyan_dye|cyan_glazed_terracotta|cyan_harness|cyan_shulker_box|cyan_stained_glass|cyan_stained_glass_pane|cyan_terracotta|cyan_wool|cyan_wool_slab|cyan_wool_stairs|damaged_anvil|dandelion|danger_pottery_sherd|dark_oak_boat|dark_oak_button|dark_oak_chest_boat|dark_oak_door|dark_oak_fence|dark_oak_fence_gate|dark_oak_hanging_sign|dark_oak_leaves|dark_oak_log|dark_oak_planks|dark_oak_pressure_plate|dark_oak_sapling|dark_oak_shelf|dark_oak_sign|dark_oak_slab|dark_oak_stairs|dark_oak_trapdoor|dark_oak_wood|dark_prismarine|dark_prismarine_slab|dark_prismarine_stairs|daylight_detector|dead_brain_coral|dead_brain_coral_block|dead_brain_coral_fan|dead_bubble_coral|dead_bubble_coral_block|dead_bubble_coral_fan|dead_bush|dead_fire_coral|dead_fire_coral_block|dead_fire_coral_fan|dead_horn_coral|dead_horn_coral_block|dead_horn_coral_fan|dead_tube_coral|dead_tube_coral_block|dead_tube_coral_fan|debug_stick|decorated_pot|deepslate|deepslate_brick_slab|deepslate_brick_stairs|deepslate_brick_wall|deepslate_bricks|deepslate_coal_ore|deepslate_copper_ore|deepslate_diamond_ore|deepslate_emerald_ore|deepslate_gold_ore|deepslate_iron_ore|deepslate_lapis_ore|deepslate_redstone_ore|deepslate_tile_slab|deepslate_tile_stairs|deepslate_tile_wall|deepslate_tiles|desert_pyramid_map|desert_village_map|detector_rail|diamond|diamond_axe|diamond_block|diamond_boots|diamond_chestplate|diamond_helmet|diamond_hoe|diamond_horse_armor|diamond_leggings|diamond_nautilus_armor|diamond_ore|diamond_pickaxe|diamond_shovel|diamond_spear|diamond_sword|diorite|diorite_slab|diorite_stairs|diorite_wall|dirt|dirt_path|disc_fragment_5|dispenser|dolphin_spawn_egg|donkey_spawn_egg|dragon_breath|dragon_egg|dragon_head|dried_ghast|dried_kelp|dried_kelp_block|dripstone_block|dropper|drowned_spawn_egg|dune_armor_trim_smithing_template|echo_shard|egg|elder_guardian_spawn_egg|elytra|emerald|emerald_block|emerald_ore|enchanted_book|enchanted_golden_apple|enchanting_table|end_crystal|end_portal_frame|end_rod|end_stone|end_stone_brick_slab|end_stone_brick_stairs|end_stone_brick_wall|end_stone_bricks|ender_chest|ender_dragon_spawn_egg|ender_eye|ender_pearl|enderman_spawn_egg|endermite_spawn_egg|evoker_spawn_egg|experience_bottle|explorer_pottery_sherd|exposed_chiseled_copper|exposed_copper|exposed_copper_bars|exposed_copper_bulb|exposed_copper_chain|exposed_copper_chest|exposed_copper_door|exposed_copper_golem_statue|exposed_copper_grate|exposed_copper_lantern|exposed_copper_trapdoor|exposed_cut_copper|exposed_cut_copper_slab|exposed_cut_copper_stairs|exposed_lightning_rod|eye_armor_trim_smithing_template|farmland|feather|fermented_spider_eye|fern|field_masoned_banner_pattern|filled_map|fire_charge|fire_coral|fire_coral_block|fire_coral_fan|firefly_bush|firework_rocket|firework_star|fishing_rod|fletching_table|flint|flint_and_steel|flow_armor_trim_smithing_template|flow_banner_pattern|flow_pottery_sherd|flower_banner_pattern|flower_pot|flowering_azalea|flowering_azalea_leaves|fox_spawn_egg|friend_pottery_sherd|frog_spawn_egg|frogspawn|frostbite_spawn_egg|furnace|furnace_minecart|ghast_spawn_egg|ghast_tear|gilded_blackstone|glass|glass_bottle|glass_pane|glistering_melon_slice|globe_banner_pattern|glow_berries|glow_ink_sac|glow_item_frame|glow_lichen|glow_squid_spawn_egg|glowstone|glowstone_dust|goat_horn|goat_spawn_egg|gold_block|gold_ingot|gold_nugget|gold_ore|golden_apple|golden_axe|golden_boots|golden_carrot|golden_chestplate|golden_dandelion|golden_helmet|golden_hoe|golden_horse_armor|golden_leggings|golden_nautilus_armor|golden_pickaxe|golden_shovel|golden_spear|golden_sword|granite|granite_slab|granite_stairs|granite_wall|grass_block|gravel|gray_banner|gray_bed|gray_bundle|gray_candle|gray_carpet|gray_concrete|gray_concrete_powder|gray_concrete_slab|gray_concrete_stairs|gray_cushion|gray_dye|gray_glazed_terracotta|gray_harness|gray_shulker_box|gray_stained_glass|gray_stained_glass_pane|gray_terracotta|gray_wool|gray_wool_slab|gray_wool_stairs|green_banner|green_bed|green_bundle|green_candle|green_carpet|green_concrete|green_concrete_powder|green_concrete_slab|green_concrete_stairs|green_cushion|green_dye|green_glazed_terracotta|green_harness|green_shulker_box|green_stained_glass|green_stained_glass_pane|green_terracotta|green_wool|green_wool_slab|green_wool_stairs|grindstone|guardian_spawn_egg|gunpowder|guster_banner_pattern|guster_pottery_sherd|hanging_roots|happy_ghast_spawn_egg|hay_block|heart_of_the_sea|heart_pottery_sherd|heartbreak_pottery_sherd|heavy_core|heavy_weighted_pressure_plate|hoglin_spawn_egg|honey_block|honey_bottle|honeycomb|honeycomb_block|hopper|hopper_minecart|horn_coral|horn_coral_block|horn_coral_fan|horse_spawn_egg|host_armor_trim_smithing_template|howl_pottery_sherd|husk_spawn_egg|ice|ice_ball|ice_crystal|icicle|infested_chiseled_stone_bricks|infested_cobblestone|infested_cracked_stone_bricks|infested_deepslate|infested_mossy_stone_bricks|infested_stone|infested_stone_bricks|ink_sac|iron_axe|iron_bars|iron_block|iron_boots|iron_chain|iron_chestplate|iron_door|iron_golem_spawn_egg|iron_helmet|iron_hoe|iron_horse_armor|iron_ingot|iron_leggings|iron_nautilus_armor|iron_nugget|iron_ore|iron_pickaxe|iron_shovel|iron_spear|iron_sword|iron_trapdoor|item_frame|jack_o_lantern|jigsaw|jukebox|jungle_boat|jungle_button|jungle_chest_boat|jungle_door|jungle_fence|jungle_fence_gate|jungle_hanging_sign|jungle_leaves|jungle_log|jungle_planks|jungle_pressure_plate|jungle_pyramid_map|jungle_sapling|jungle_shelf|jungle_sign|jungle_slab|jungle_stairs|jungle_trapdoor|jungle_wood|kelp|knowledge_book|ladder|lantern|lapis_block|lapis_lazuli|lapis_ore|large_amethyst_bud|large_fern|lava_bucket|lead|leaf_litter|leather|leather_boots|leather_chestplate|leather_helmet|leather_horse_armor|leather_leggings|lectern|lever|light|light_blue_banner|light_blue_bed|light_blue_bundle|light_blue_candle|light_blue_carpet|light_blue_concrete|light_blue_concrete_powder|light_blue_concrete_slab|light_blue_concrete_stairs|light_blue_cushion|light_blue_dye|light_blue_glazed_terracotta|light_blue_harness|light_blue_shulker_box|light_blue_stained_glass|light_blue_stained_glass_pane|light_blue_terracotta|light_blue_wool|light_blue_wool_slab|light_blue_wool_stairs|light_gray_banner|light_gray_bed|light_gray_bundle|light_gray_candle|light_gray_carpet|light_gray_concrete|light_gray_concrete_powder|light_gray_concrete_slab|light_gray_concrete_stairs|light_gray_cushion|light_gray_dye|light_gray_glazed_terracotta|light_gray_harness|light_gray_shulker_box|light_gray_stained_glass|light_gray_stained_glass_pane|light_gray_terracotta|light_gray_wool|light_gray_wool_slab|light_gray_wool_stairs|light_weighted_pressure_plate|lightning_rod|lilac|lily_of_the_valley|lily_pad|lime_banner|lime_bed|lime_bundle|lime_candle|lime_carpet|lime_concrete|lime_concrete_powder|lime_concrete_slab|lime_concrete_stairs|lime_cushion|lime_dye|lime_glazed_terracotta|lime_harness|lime_shulker_box|lime_stained_glass|lime_stained_glass_pane|lime_terracotta|lime_wool|lime_wool_slab|lime_wool_stairs|lingering_potion|llama_spawn_egg|lodestone|loom|mace|magenta_banner|magenta_bed|magenta_bundle|magenta_candle|magenta_carpet|magenta_concrete|magenta_concrete_powder|magenta_concrete_slab|magenta_concrete_stairs|magenta_cushion|magenta_dye|magenta_glazed_terracotta|magenta_harness|magenta_shulker_box|magenta_stained_glass|magenta_stained_glass_pane|magenta_terracotta|magenta_wool|magenta_wool_slab|magenta_wool_stairs|magma_block|magma_cream|magma_cube_spawn_egg|mangrove_boat|mangrove_button|mangrove_chest_boat|mangrove_door|mangrove_fence|mangrove_fence_gate|mangrove_hanging_sign|mangrove_leaves|mangrove_log|mangrove_planks|mangrove_pressure_plate|mangrove_propagule|mangrove_roots|mangrove_shelf|mangrove_sign|mangrove_slab|mangrove_stairs|mangrove_trapdoor|mangrove_wood|map|medium_amethyst_bud|melon|melon_seeds|melon_slice|milk_bucket|minecart|miner_pottery_sherd|mojang_banner_pattern|mooshroom_spawn_egg|moss_block|moss_carpet|mossy_cobblestone|mossy_cobblestone_slab|mossy_cobblestone_stairs|mossy_cobblestone_wall|mossy_stone_brick_slab|mossy_stone_brick_stairs|mossy_stone_brick_wall|mossy_stone_bricks|mourner_pottery_sherd|mud|mud_brick_slab|mud_brick_stairs|mud_brick_wall|mud_bricks|muddy_mangrove_roots|mule_spawn_egg|mushroom_stem|mushroom_stew|music_disc_11|music_disc_13|music_disc_5|music_disc_blocks|music_disc_bounce|music_disc_cat|music_disc_chirp|music_disc_creator|music_disc_creator_music_box|music_disc_far|music_disc_lava_chicken|music_disc_mall|music_disc_mellohi|music_disc_otherside|music_disc_pigstep|music_disc_precipice|music_disc_relic|music_disc_stal|music_disc_strad|music_disc_tears|music_disc_wait|music_disc_ward|mutton|mycelium|name_tag|nautilus_shell|nautilus_spawn_egg|nether_brick|nether_brick_fence|nether_brick_slab|nether_brick_stairs|nether_brick_wall|nether_bricks|nether_gold_ore|nether_quartz_ore|nether_sprouts|nether_star|nether_wart|nether_wart_block|netherite_axe|netherite_block|netherite_boots|netherite_chestplate|netherite_helmet|netherite_hoe|netherite_horse_armor|netherite_ingot|netherite_leggings|netherite_nautilus_armor|netherite_pickaxe|netherite_scrap|netherite_shovel|netherite_spear|netherite_sword|netherite_upgrade_smithing_template|netherrack|note_block|oak_boat|oak_button|oak_chest_boat|oak_door|oak_fence|oak_fence_gate|oak_hanging_sign|oak_leaves|oak_log|oak_planks|oak_pressure_plate|oak_sapling|oak_shelf|oak_sign|oak_slab|oak_stairs|oak_trapdoor|oak_wood|observer|obsidian|ocean_monument_map|ocelot_spawn_egg|ochre_froglight|ominous_bottle|ominous_trial_key|open_eyeblossom|orange_banner|orange_bed|orange_bundle|orange_candle|orange_carpet|orange_concrete|orange_concrete_powder|orange_concrete_slab|orange_concrete_stairs|orange_cushion|orange_dye|orange_glazed_terracotta|orange_harness|orange_poplar_leaves|orange_shulker_box|orange_stained_glass|orange_stained_glass_pane|orange_terracotta|orange_tulip|orange_wool|orange_wool_slab|orange_wool_stairs|oxeye_daisy|oxidized_chiseled_copper|oxidized_copper|oxidized_copper_bars|oxidized_copper_bulb|oxidized_copper_chain|oxidized_copper_chest|oxidized_copper_door|oxidized_copper_golem_statue|oxidized_copper_grate|oxidized_copper_lantern|oxidized_copper_trapdoor|oxidized_cut_copper|oxidized_cut_copper_slab|oxidized_cut_copper_stairs|oxidized_lightning_rod|packed_ice|packed_ice_brick_slab|packed_ice_brick_stairs|packed_ice_brick_wall|packed_ice_bricks|packed_mud|painting|pale_hanging_moss|pale_moss_block|pale_moss_carpet|pale_oak_boat|pale_oak_button|pale_oak_chest_boat|pale_oak_door|pale_oak_fence|pale_oak_fence_gate|pale_oak_hanging_sign|pale_oak_leaves|pale_oak_log|pale_oak_planks|pale_oak_pressure_plate|pale_oak_sapling|pale_oak_shelf|pale_oak_sign|pale_oak_slab|pale_oak_stairs|pale_oak_trapdoor|pale_oak_wood|panda_spawn_egg|paper|parched_spawn_egg|parrot_spawn_egg|pearlescent_froglight|peony|petrified_oak_slab|phantom_membrane|phantom_spawn_egg|pig_spawn_egg|piglin_banner_pattern|piglin_brute_spawn_egg|piglin_head|piglin_spawn_egg|pillager_spawn_egg|pink_banner|pink_bed|pink_bundle|pink_candle|pink_carpet|pink_concrete|pink_concrete_powder|pink_concrete_slab|pink_concrete_stairs|pink_cushion|pink_dye|pink_glazed_terracotta|pink_harness|pink_petals|pink_shulker_box|pink_stained_glass|pink_stained_glass_pane|pink_terracotta|pink_tulip|pink_wool|pink_wool_slab|pink_wool_stairs|piston|pitcher_plant|pitcher_pod|plains_village_map|player_head|plenty_pottery_sherd|podzol|pointed_dripstone|poisonous_potato|polar_bear_spawn_egg|polished_andesite|polished_andesite_slab|polished_andesite_stairs|polished_basalt|polished_blackstone|polished_blackstone_brick_slab|polished_blackstone_brick_stairs|polished_blackstone_brick_wall|polished_blackstone_bricks|polished_blackstone_button|polished_blackstone_pressure_plate|polished_blackstone_slab|polished_blackstone_stairs|polished_blackstone_wall|polished_cinnabar|polished_cinnabar_slab|polished_cinnabar_stairs|polished_cinnabar_wall|polished_deepslate|polished_deepslate_slab|polished_deepslate_stairs|polished_deepslate_wall|polished_diorite|polished_diorite_slab|polished_diorite_stairs|polished_granite|polished_granite_slab|polished_granite_stairs|polished_sulfur|polished_sulfur_slab|polished_sulfur_stairs|polished_sulfur_wall|polished_tuff|polished_tuff_slab|polished_tuff_stairs|polished_tuff_wall|poplar_boat|poplar_button|poplar_chest_boat|poplar_door|poplar_fence|poplar_fence_gate|poplar_hanging_sign|poplar_leaves|poplar_log|poplar_planks|poplar_pressure_plate|poplar_sapling|poplar_shelf|poplar_sign|poplar_slab|poplar_stairs|poplar_trapdoor|poplar_wood|popped_chorus_fruit|poppy|porkchop|potato|potent_sulfur|potion|powder_snow_bucket|powered_rail|prismarine|prismarine_brick_slab|prismarine_brick_stairs|prismarine_bricks|prismarine_crystals|prismarine_shard|prismarine_slab|prismarine_stairs|prismarine_wall|prize_pottery_sherd|pufferfish|pufferfish_bucket|pufferfish_spawn_egg|pumpkin|pumpkin_pie|pumpkin_seeds|purple_banner|purple_bed|purple_bundle|purple_candle|purple_carpet|purple_concrete|purple_concrete_powder|purple_concrete_slab|purple_concrete_stairs|purple_cushion|purple_dye|purple_glazed_terracotta|purple_harness|purple_shulker_box|purple_stained_glass|purple_stained_glass_pane|purple_terracotta|purple_wool|purple_wool_slab|purple_wool_stairs|purpur_block|purpur_pillar|purpur_slab|purpur_stairs|quartz|quartz_block|quartz_bricks|quartz_pillar|quartz_slab|quartz_stairs|rabbit|rabbit_foot|rabbit_hide|rabbit_spawn_egg|rabbit_stew|rail|raiser_armor_trim_smithing_template|ravager_spawn_egg|raw_copper|raw_copper_block|raw_gold|raw_gold_block|raw_iron|raw_iron_block|recovery_compass|red_banner|red_bed|red_bundle|red_candle|red_carpet|red_concrete|red_concrete_powder|red_concrete_slab|red_concrete_stairs|red_cushion|red_dye|red_glazed_terracotta|red_harness|red_mushroom|red_mushroom_block|red_nether_brick_slab|red_nether_brick_stairs|red_nether_brick_wall|red_nether_bricks|red_poplar_leaves|red_sand|red_sandstone|red_sandstone_slab|red_sandstone_stairs|red_sandstone_wall|red_shrub|red_shulker_box|red_stained_glass|red_stained_glass_pane|red_terracotta|red_tulip|red_wool|red_wool_slab|red_wool_stairs|redstone|redstone_block|redstone_lamp|redstone_ore|redstone_torch|reinforced_deepslate|repeater|repeating_command_block|resin_block|resin_brick|resin_brick_slab|resin_brick_stairs|resin_brick_wall|resin_bricks|resin_clump|respawn_anchor|rib_armor_trim_smithing_template|rooted_dirt|rose_bush|rotten_flesh|saddle|salmon|salmon_bucket|salmon_spawn_egg|sand|sandstone|sandstone_slab|sandstone_stairs|sandstone_wall|savanna_village_map|scaffolding|scrape_pottery_sherd|sculk|sculk_catalyst|sculk_sensor|sculk_shrieker|sculk_vein|sea_lantern|sea_pickle|seagrass|sentry_armor_trim_smithing_template|shaper_armor_trim_smithing_template|sheaf_pottery_sherd|shears|sheep_spawn_egg|shelf_mushroom|shelter_pottery_sherd|shield|short_dry_grass|short_grass|shroomlight|shulker_box|shulker_shell|shulker_spawn_egg|silence_armor_trim_smithing_template|silverfish_spawn_egg|skeleton_horse_spawn_egg|skeleton_skull|skeleton_spawn_egg|skull_banner_pattern|skull_pottery_sherd|slime_ball|slime_block|slime_spawn_egg|small_amethyst_bud|small_dripleaf|smithing_table|smoker|smooth_basalt|smooth_quartz|smooth_quartz_slab|smooth_quartz_stairs|smooth_red_sandstone|smooth_red_sandstone_slab|smooth_red_sandstone_stairs|smooth_sandstone|smooth_sandstone_slab|smooth_sandstone_stairs|smooth_stone|smooth_stone_slab|sniffer_egg|sniffer_spawn_egg|snort_pottery_sherd|snout_armor_trim_smithing_template|snow|snow_block|snow_brick_slab|snow_brick_stairs|snow_brick_wall|snow_bricks|snow_golem_spawn_egg|snowball|snowy_village_map|soul_campfire|soul_lantern|soul_sand|soul_soil|soul_torch|spawner|spectral_arrow|spider_eye|spider_spawn_egg|spire_armor_trim_smithing_template|splash_potion|sponge|spore_blossom|spruce_boat|spruce_button|spruce_chest_boat|spruce_door|spruce_fence|spruce_fence_gate|spruce_hanging_sign|spruce_leaves|spruce_log|spruce_planks|spruce_pressure_plate|spruce_sapling|spruce_shelf|spruce_sign|spruce_slab|spruce_stairs|spruce_trapdoor|spruce_wood|spyglass|squid_spawn_egg|stick|sticky_piston|stone|stone_axe|stone_brick_slab|stone_brick_stairs|stone_brick_wall|stone_bricks|stone_button|stone_hoe|stone_pickaxe|stone_pressure_plate|stone_shovel|stone_slab|stone_spear|stone_stairs|stone_sword|stonecutter|straw_bed|stray_spawn_egg|strider_spawn_egg|string|stripped_acacia_log|stripped_acacia_wood|stripped_bamboo_block|stripped_birch_log|stripped_birch_wood|stripped_cherry_log|stripped_cherry_wood|stripped_crimson_hyphae|stripped_crimson_stem|stripped_dark_oak_log|stripped_dark_oak_wood|stripped_jungle_log|stripped_jungle_wood|stripped_mangrove_log|stripped_mangrove_wood|stripped_oak_log|stripped_oak_wood|stripped_pale_oak_log|stripped_pale_oak_wood|stripped_poplar_log|stripped_poplar_wood|stripped_spruce_log|stripped_spruce_wood|stripped_warped_hyphae|stripped_warped_stem|structure_block|structure_void|sugar|sugar_cane|sulfur|sulfur_brick_slab|sulfur_brick_stairs|sulfur_brick_wall|sulfur_bricks|sulfur_cube_bucket|sulfur_cube_spawn_egg|sulfur_slab|sulfur_spike|sulfur_stairs|sulfur_wall|sunflower|suspicious_gravel|suspicious_sand|suspicious_stew|swamp_hut_map|sweet_berries|tadpole_bucket|tadpole_spawn_egg|taiga_village_map|tall_dry_grass|tall_grass|target|terracotta|test_block|test_instance_block|tide_armor_trim_smithing_template|tinted_glass|tipped_arrow|tnt|tnt_minecart|torch|torchflower|torchflower_seeds|totem_of_undying|trader_llama_spawn_egg|trapped_chest|trial_key|trial_spawner|trident|tripwire_hook|tropical_fish|tropical_fish_bucket|tropical_fish_spawn_egg|tube_coral|tube_coral_block|tube_coral_fan|tuff|tuff_brick_slab|tuff_brick_stairs|tuff_brick_wall|tuff_bricks|tuff_slab|tuff_stairs|tuff_wall|turtle_egg|turtle_helmet|turtle_scute|turtle_spawn_egg|twisting_vines|vault|verdant_froglight|vex_armor_trim_smithing_template|vex_spawn_egg|villager_spawn_egg|vindicator_spawn_egg|vine|wandering_trader_spawn_egg|ward_armor_trim_smithing_template|warden_spawn_egg|warm_ocean_ruins_map|warped_button|warped_door|warped_fence|warped_fence_gate|warped_fungus|warped_fungus_on_a_stick|warped_hanging_sign|warped_hyphae|warped_nylium|warped_planks|warped_pressure_plate|warped_roots|warped_shelf|warped_sign|warped_slab|warped_stairs|warped_stem|warped_trapdoor|warped_wart_block|water_bucket|waxed_chiseled_copper|waxed_copper_bars|waxed_copper_block|waxed_copper_bulb|waxed_copper_chain|waxed_copper_chest|waxed_copper_door|waxed_copper_golem_statue|waxed_copper_grate|waxed_copper_lantern|waxed_copper_trapdoor|waxed_cut_copper|waxed_cut_copper_slab|waxed_cut_copper_stairs|waxed_exposed_chiseled_copper|waxed_exposed_copper|waxed_exposed_copper_bars|waxed_exposed_copper_bulb|waxed_exposed_copper_chain|waxed_exposed_copper_chest|waxed_exposed_copper_door|waxed_exposed_copper_golem_statue|waxed_exposed_copper_grate|waxed_exposed_copper_lantern|waxed_exposed_copper_trapdoor|waxed_exposed_cut_copper|waxed_exposed_cut_copper_slab|waxed_exposed_cut_copper_stairs|waxed_exposed_lightning_rod|waxed_lightning_rod|waxed_oxidized_chiseled_copper|waxed_oxidized_copper|waxed_oxidized_copper_bars|waxed_oxidized_copper_bulb|waxed_oxidized_copper_chain|waxed_oxidized_copper_chest|waxed_oxidized_copper_door|waxed_oxidized_copper_golem_statue|waxed_oxidized_copper_grate|waxed_oxidized_copper_lantern|waxed_oxidized_copper_trapdoor|waxed_oxidized_cut_copper|waxed_oxidized_cut_copper_slab|waxed_oxidized_cut_copper_stairs|waxed_oxidized_lightning_rod|waxed_weathered_chiseled_copper|waxed_weathered_copper|waxed_weathered_copper_bars|waxed_weathered_copper_bulb|waxed_weathered_copper_chain|waxed_weathered_copper_chest|waxed_weathered_copper_door|waxed_weathered_copper_golem_statue|waxed_weathered_copper_grate|waxed_weathered_copper_lantern|waxed_weathered_copper_trapdoor|waxed_weathered_cut_copper|waxed_weathered_cut_copper_slab|waxed_weathered_cut_copper_stairs|waxed_weathered_lightning_rod|wayfinder_armor_trim_smithing_template|weathered_chiseled_copper|weathered_copper|weathered_copper_bars|weathered_copper_bulb|weathered_copper_chain|weathered_copper_chest|weathered_copper_door|weathered_copper_golem_statue|weathered_copper_grate|weathered_copper_lantern|weathered_copper_trapdoor|weathered_cut_copper|weathered_cut_copper_slab|weathered_cut_copper_stairs|weathered_lightning_rod|weeping_vines|wet_sponge|wheat|wheat_seeds|white_banner|white_bed|white_bundle|white_candle|white_carpet|white_concrete|white_concrete_powder|white_concrete_slab|white_concrete_stairs|white_cushion|white_dye|white_glazed_terracotta|white_harness|white_shulker_box|white_stained_glass|white_stained_glass_pane|white_terracotta|white_tulip|white_wool|white_wool_slab|white_wool_stairs|wild_armor_trim_smithing_template|wildflowers|wind_charge|witch_spawn_egg|wither_rose|wither_skeleton_skull|wither_skeleton_spawn_egg|wither_spawn_egg|wolf_armor|wolf_spawn_egg|wooden_axe|wooden_hoe|wooden_pickaxe|wooden_shovel|wooden_spear|wooden_sword|woodland_mansion_map|writable_book|written_book|yellow_banner|yellow_bed|yellow_bundle|yellow_candle|yellow_carpet|yellow_concrete|yellow_concrete_powder|yellow_concrete_slab|yellow_concrete_stairs|yellow_cushion|yellow_dye|yellow_glazed_terracotta|yellow_harness|yellow_poplar_leaves|yellow_shulker_box|yellow_stained_glass|yellow_stained_glass_pane|yellow_terracotta|yellow_wool|yellow_wool_slab|yellow_wool_stairs|zoglin_spawn_egg|zombie_head|zombie_horse_spawn_egg|zombie_nautilus_spawn_egg|zombie_spawn_egg|zombie_villager_spawn_egg|zombified_piglin_spawn_egg".split("|"));

const json = (data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}});
const safe = (s,max=120)=>typeof s==='string'?s.replace(/[^\p{L}\p{N} _./():+-]/gu,'').slice(0,max):'';
async function auth(request,env) {
  const secret=env.MLG_ADMIN_TOKEN;
  const value=(request.headers.get('authorization')||'').replace(/^Bearer /i,'');
  if(!secret||!value)return false;
  const digest=async text=>new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text)));
  const a=await digest(secret),b=await digest(value);
  return a.length===b.length&&a.every((v,i)=>v===b[i]);
}
export default {
 async fetch(request,env,ctx) {
  const url=new URL(request.url);
  // Same-origin proxy for the five fixed official Minecraft result backgrounds.
  // It prevents browser canvas-export CORS failures; tier values are allowlisted,
  // never used to fetch an arbitrary user-supplied URL.
  if(url.pathname==='/api/world-score-scene') {
   if(request.method!=='GET')return json({error:'Method not allowed'},405);
   const scenes={
    green:'https://www.minecraft.net/content/dam/minecraftnet/games/minecraft/screenshots/cherrygrove-header.jpg',
    blue:'https://www.minecraft.net/content/dam/minecraftnet/games/minecraft/screenshots/CREATE_BuildAlmostAnything.png',
    purple:'https://www.minecraft.net/content/dam/minecraftnet/games/minecraft/key-art/Vanilla-PMP_Collection-Carousel-0_Tricky-Trials_1280x768.jpg',
    gold:'https://www.minecraft.net/content/dam/minecraftnet/games/minecraft/key-art/Vanilla-PMP_Collection-Carousel-0_Nether-Update_1280x768.jpg',
    red:'https://www.minecraft.net/content/dam/minecraftnet/games/minecraft/screenshots/enderdragon-ingame.jpg'
   };
   const tier=url.searchParams.get('tier');
   if(!Object.prototype.hasOwnProperty.call(scenes,tier))return json({error:'Unknown scene'},400);
   try {
    const origin=await fetch(scenes[tier],{headers:{accept:'image/*'},signal:AbortSignal.timeout(10000),cf:{cacheEverything:true,cacheTtl:86400}});
    if(!origin.ok)throw Error('Minecraft image unavailable');
    const type=origin.headers.get('content-type')||'';
    if(!/^image\/(?:png|jpeg|webp)$/i.test(type.split(';')[0]))throw Error('Invalid image type');
    return new Response(origin.body,{status:200,headers:{'content-type':type,'cache-control':'public, max-age=86400','x-content-type-options':'nosniff'}});
   } catch(_) {return json({error:'Minecraft image temporarily unavailable'},502)}
  }
  if(url.pathname==='/api/roblox-icon') {
   if(request.method!=='GET')return json({error:'Method not allowed'},405);
   const uid=url.searchParams.get('universeId')||'';
   if(!/^[0-9]{6,20}$/.test(uid))return json({error:'Invalid game ID'},400);
   try {
    const params=new URLSearchParams({universeIds:uid,returnPolicy:'PlaceHolder',size:'256x256',format:'Png',isCircular:'false'});
    const res=await fetch('https://thumbnails.roblox.com/v1/games/icons?'+params,{headers:{accept:'application/json'},signal:AbortSignal.timeout(7000)});
    if(!res.ok)throw Error('Roblox thumbnails unavailable');
    const data=await res.json();
    const item=(data.data||[]).find(x=>String(x.targetId)===uid&&x.state==='Completed');
    const icon=item?.imageUrl;
    if(typeof icon!=='string')throw Error('No icon');
    const dest=new URL(icon);
    if(dest.protocol!=='https:'||!(dest.hostname==='tr.rbxcdn.com'||dest.hostname.endsWith('.rbxcdn.com')))throw Error('Invalid thumbnail host');
    // Redirect to the up-to-date official image. Avoid content-type errors when
    // fetching Roblox's binary CDN from a Cloudflare Worker.
    return new Response(null,{status:302,headers:{location:dest.href,'cache-control':'public, max-age=1800','x-content-type-options':'nosniff'}});
   }catch(_){return json({error:'Roblox icon temporarily unavailable'},502)}
  }
  if(url.pathname==='/api/roblox-live') {
   if(request.method!=='GET')return json({error:'Method not allowed'},405);
   // Each page load requests a fresh snapshot of the all-country, all-device
   // Roblox Top Playing Now ranking. No simulated counts, no page-level cache.
   try {
    const params=new URLSearchParams({sessionId:'mlg-live-site',sortId:'top-playing-now',device:'computer',country:'all'});
    const originUrl='https://apis.roblox.com/explore-api/v1/get-sort-content?'+params.toString();
    const upstream=await fetch(originUrl,{headers:{'accept':'application/json'},signal:AbortSignal.timeout(8500),cache:'no-store'});
    if(!upstream.ok)throw Error('Official Roblox chart returned '+upstream.status);
    const data=await upstream.json();
    if(data?.sortId!=='top-playing-now'||!Array.isArray(data.games))throw Error('Invalid official Roblox response');
    const uniq=new Map();
    for(const entry of data.games) {
      if(entry?.isSponsored||!entry?.rootPlaceId||!Number.isInteger(entry?.playerCount)||entry.playerCount<0)continue;
      const id=String(entry.rootPlaceId);
      if(!/^\d{6,20}$/.test(id))continue;
      const up=entry.totalUpVotes,down=entry.totalDownVotes;
      uniq.set(id,{
       placeId:id,universeId:String(entry.universeId||''),name:String(entry.name||'ROBLOXゲーム').slice(0,160),
       officialName:String(entry.name||'').slice(0,160),playing:entry.playerCount,
       rating:Number.isInteger(up)&&Number.isInteger(down)&&up+down>0?Math.round(up/(up+down)*1000)/10:null
      });
    }
    const games=[...uniq.values()].sort((a,b)=>b.playing-a.playing).slice(0,30);
    if(games.length!==30)throw Error('Only '+games.length+' Roblox games available');
    // The discover chart identifies which 30 games are popular, but its
    // playerCount is often a cached chart snapshot. Fetch the actual "playing"
    // value for each selected universe from Roblox's game-details endpoint.
    // A unique query key bypasses intermediary URL caches on every visit.
    const universeIds=games.map(g=>g.universeId).filter(id=>/^[0-9]{6,20}$/.test(id));
    const liveNonce=Date.now().toString(36)+'-'+crypto.randomUUID().slice(0,8);
    const countsPromise=(async()=>{
     try{
      const detailsParams=new URLSearchParams({universeIds:universeIds.join(','),_fresh:liveNonce});
      const response=await fetch('https://games.roblox.com/v1/games?'+detailsParams,{
       headers:{'accept':'application/json','cache-control':'no-cache'},
       signal:AbortSignal.timeout(8500),cache:'no-store'
      });
      if(!response.ok)throw Error('Experience details returned '+response.status);
      const result=await response.json();
      if(!Array.isArray(result.data))throw Error('Invalid experience details');
      const byUniverse=new Map(result.data.filter(g=>g&&Number.isSafeInteger(g.playing)&&g.playing>=0)
       .map(g=>[String(g.id),g.playing]));
      let updatedCount=0;
      for(const game of games){
       const c=byUniverse.get(game.universeId);
       if(c!==undefined){game.playing=c;updatedCount++}
      }
      return updatedCount;
     }catch(_){return 0}
    })();
    // Icons are independent of player counts. Neither path can make up counts.
    const iconsPromise=(async()=>{
     try{
      if(!universeIds.length)return;
      const thumbParams=new URLSearchParams({universeIds:universeIds.join(','),returnPolicy:'PlaceHolder',size:'256x256',format:'Png',isCircular:'false'});
      const response=await fetch('https://thumbnails.roblox.com/v1/games/icons?'+thumbParams,{
       headers:{accept:'application/json'},signal:AbortSignal.timeout(4500)
      });
      if(!response.ok)return;
      const data=await response.json();
      const byUniverse=new Map();
      for(const item of data.data||[]){
       if(item?.state!=='Completed'||typeof item.imageUrl!=='string')continue;
       let parsed;
       try{parsed=new URL(item.imageUrl)}catch{continue}
       if(parsed.protocol==='https:'&&(parsed.hostname==='tr.rbxcdn.com'||parsed.hostname.endsWith('.rbxcdn.com')))
        byUniverse.set(String(item.targetId),parsed.href);
      }
      for(const game of games)if(byUniverse.has(game.universeId))game.icon=byUniverse.get(game.universeId);
     }catch(_){}
    })();
    const [updatedCount]=await Promise.all([countsPromise,iconsPromise]);
    // Order after replacing chart estimates with the freshest available official counts.
    games.sort((a,b)=>b.playing-a.playing);
    const countSource=updatedCount===games.length?'experience-details':updatedCount>0?'mixed':'chart';
    const fetchedAt=new Date().toISOString();
    return json({
     source:'Roblox Top Playing Now — all countries and devices',
     countSource,detailCount:updatedCount,totalCount:games.length,
     updatedAt:fetchedAt,requestedAt:fetchedAt,games
    });
   }catch(e){
    return json({error:'Robloxの最新データを取得できませんでした'},503);
   }
  }
  // Minecraft World Score: anonymous statistics retained for 90-day percentile comparison.
  if(url.pathname==='/api/world-score-submit') {
   if(request.method!=='POST')return json({ok:false,message:'Method not allowed'},405);
   if(!env.MLG_EVENTS)return json({ok:false,message:'点数比較データの受付が準備中です'},503);
   const origin=request.headers.get('origin');
   if(origin!==url.origin)return json({ok:false,message:'Forbidden'},403);
   const contentType=request.headers.get('content-type')||'';
   if(!contentType.toLowerCase().startsWith('application/json'))return json({ok:false,message:'JSONが必要です'},415);
   const size=Number(request.headers.get('content-length')||0);
   if(size>1200)return json({ok:false,message:'Payload too large'},413);
   let body;
   try{
    const raw=await request.text();
    if(raw.length>1200)return json({ok:false,message:'Payload too large'},413);
    body=JSON.parse(raw);
   }catch(e){return json({ok:false,message:'Invalid JSON'},400)}
   const caps=[60000,15000,10000,8000,7000];
   const goodInteger=(n,max)=>Number.isSafeInteger(n)&&n>=0&&n<=max;
   if(!['wd-score-v2','wd-score-v3'].includes(body?.version)||!Array.isArray(body.points)||body.points.length!==5
     ||!body.points.every((p,i)=>goodInteger(p,caps[i]))
     ||!goodInteger(body.score,100000)||body.points.reduce((a,b)=>a+b,0)!==body.score
     ||!goodInteger(body.placed,1000000000)
     ||typeof body.hours!=='number'||!Number.isFinite(body.hours)||body.hours<0||body.hours>1000000
     ||typeof body.distance!=='number'||!Number.isFinite(body.distance)||body.distance<0||body.distance>10000000)
    return json({ok:false,message:'診断データの形式が正しくありません'},400);
   const ranks=[[90000,'伝説級ワールド'],[72000,'大都市級ワールド'],[50000,'発展都市級ワールド'],[30000,'発展拠点級ワールド'],[12000,'開拓拠点級ワールド'],[0,'開拓初期']];
   const expected=ranks.find(r=>body.score>=r[0])[1];
   if(body.grade!==expected)return json({ok:false,message:'スコアと称号が一致しません'},400);
   try{
    env.MLG_EVENTS.writeDataPoint({
     blobs:['world_score',body.grade,body.version,new Date().toISOString().slice(0,10)],
     doubles:[body.score,...body.points,body.placed,body.hours,body.distance,1],
     indexes:['world_score']
    });
    return json({ok:true,status:'collected'});
   }catch(err){return json({ok:false,message:'集計の受付に失敗しました'},503)}
  }

  // A personal percentile is a comparison of anonymous submissions, NOT a
  // unique-user leaderboard. Only scores and counts leave this API.
  if(url.pathname==='/api/world-score-percentile') {
    if(request.method!=='GET')return json({error:'Method not allowed'},405);
    const rawScore=url.searchParams.get('score');
    if(rawScore===null||!/^(?:0|[1-9][0-9]{0,5})$/.test(rawScore))
      return json({error:'0〜100,000の点数を指定してください'},400);
    const score=Number(rawScore);
    if(!Number.isSafeInteger(score)||score>100000)
      return json({error:'点数が範囲外です'},400);
    if(!env.MLG_SQL)return json({status:'unavailable',message:'集計データに接続できません'},503);
    try{
      const result=await env.MLG_SQL.query({query:`SELECT
        COUNT() AS submissions,
        countIf(double1 > ${score}) AS higher,
        countIf(double1 = ${score}) AS tied
        FROM ${DATASET}
        WHERE blob1 = 'world_score'
        AND timestamp >= NOW() - INTERVAL '90' DAY`});
      const row=result.data?.[0]||{};
      const total=Number(row.submissions||0);
      const higher=Number(row.higher||0);
      const tied=Number(row.tied||0);
      if(![total,higher,tied].every(n=>Number.isFinite(n)&&n>=0)||higher+tied>total+0.01)
        throw Error('Bad aggregate');
      const common={periodDays:90,submissions:Math.round(total),sampled:true,comparison:'submissions',minimumSamples:10};
      if(total<10)
        return json({...common,status:'insufficient',message:'比較に必要な採点結果を集計中'});
      // Mid-rank for ties, so identical scores receive the same fair percentile.
      const topPercent=Math.max(0,Math.min(100,(higher+tied/2)/total*100));
      // Never imply an exact world/player rank from anonymous sampled events.
      return json({...common,status:'ready',topPercent:Math.round(topPercent*10)/10,
        updatedAt:new Date().toISOString()});
    }catch(err){
      return json({status:'unavailable',message:'現在スコア比較を取得できません'},503);
    }
  }
  // Private aggregate diagnostics only; no public leaderboard.
  if(url.pathname==='/api/world-score-admin') {
   if(request.method!=='GET')return json({error:'Method not allowed'},405);
   if(!await auth(request,env))return json({error:'Unauthorized'},401);
   if(!env.MLG_SQL)return json({error:'Analytics SQL binding is unavailable'},503);
   try{
    const result=await env.MLG_SQL.query({query:`SELECT blob2 AS grade, COUNT() AS samples, COUNT() AS approximate_submissions, AVG(double1) AS average_score, APPROX_MAX(double1) AS max_score FROM ${DATASET} WHERE blob1 = 'world_score' AND timestamp >= NOW() - INTERVAL '90' DAY GROUP BY blob2 ORDER BY average_score DESC LIMIT 30`});
    return json({status:'collecting',sampled:true,rows:result.data||[],updatedAt:new Date().toISOString()});
   }catch(err){return json({error:'ランキング集計を読み込めませんでした'},503)}
  }
  if(url.pathname==='/api/affiliate-event') {
   if(request.method!=='POST')return json({error:'Method not allowed'},405);
   if(!env.MLG_EVENTS)return json({error:'Tracking is not configured'},503);
   const origin=request.headers.get('origin');
   if(origin&&origin!==url.origin)return json({error:'Forbidden'},403);
   const len=Number(request.headers.get('content-length')||0);
   if(len>1200)return json({error:'Payload too large'},413);
   let data;try{data=await request.json()}catch{return json({error:'Invalid JSON'},400)}
   if(!['pageview','impression','click'].includes(data?.event))return json({error:'Invalid event'},400);
   const platform=['amazon','a8','adsterra','ninja','other','site'].includes(data.platform)?data.platform:'other';
   const path=safe(data.path,180);
   if(!path.startsWith('/')||path.startsWith('/admin/'))return json({error:'Invalid path'},400);
   const item=safe(data.item,140),date=new Date().toISOString().slice(0,10);
   env.MLG_EVENTS.writeDataPoint({blobs:[data.event,platform,path,item,date],doubles:[1],indexes:[platform]});
   return json({ok:true});
  }
  if(url.pathname==='/api/affiliate-summary'){
   if(request.method!=='GET')return json({error:'Method not allowed'},405);
   if(!env.MLG_ADMIN_TOKEN)return json({error:'管理用トークンが未設定です'},503);
   if(!await auth(request,env))return json({error:'認証が必要です'},401);
   if(!env.MLG_SQL)return json({error:'Analytics SQL binding is unavailable'},503);
   const days=[7,30,90].includes(Number(url.searchParams.get('days')))?Number(url.searchParams.get('days')):30;
   try{
    const result=await env.MLG_SQL.query({query:`SELECT blob1 AS event,blob2 AS platform,blob3 AS page,blob4 AS item,blob5 AS day,SUM(_sample_interval) AS hits FROM ${DATASET} WHERE timestamp >= NOW() - INTERVAL '${days}' DAY GROUP BY blob1,blob2,blob3,blob4,blob5 ORDER BY hits DESC LIMIT 5000`});
    return json({source:'Cloudflare Workers Analytics Engine',days,rows:result.data||[],sampled:true,updatedAt:new Date().toISOString()});
   }catch(err){return json({error:'計測データを読み込めませんでした',detail:String(err.message||err).slice(0,180)},503)}
  }
  // GSC URL cleanup: this is a directory, not a missing item. Readers who
  // follow a bare /detail/ link should land at the actual catalog index.
  if((url.pathname==='/minecraft/strategy/items/detail/' || url.pathname==='/minecraft/strategy/items/detail')
    && (request.method==='GET' || request.method==='HEAD'))
    return Response.redirect(new URL('/minecraft/strategy/items/',url),301);

  // AdSense content-quality review: auto-generated item-detail pages have
  // short generic descriptions. Preserve the encyclopedia's usability but
  // temporarily stop monetization and indexing on those detail pages.
  const isAutoItemDetail=url.pathname.startsWith('/minecraft/strategy/items/detail/');
  // The rare-mob index is a substantial comparison guide. Some individual
  // mob pages are currently short, so keep them usable without indexing or ads.
  const isBriefRareMobDetail=/^\/minecraft\/strategy\/rare-mobs\/[^/]+(?:\.html)?$/.test(url.pathname)
    && !/^\/minecraft\/strategy\/rare-mobs\/index(?:\.html)?$/.test(url.pathname);
  // Old item bookmarks redirect to a single functional data browser with an
  // item-specific selection. No duplicate item HTMLs are published as assets.
  if(isAutoItemDetail && (request.method==='GET'||request.method==='HEAD')) {
    const raw=url.pathname.slice('/minecraft/strategy/items/detail/'.length);
    const item=raw==='new' || raw==='new.html' ? url.searchParams.get('item') : raw.replace(/\.html$/,'');
    if(item && VALID_ITEM_SLUGS.has(item)) {
      const target=new URL('/minecraft/strategy/items/view',url.origin);
      target.searchParams.set('item',item);
      return Response.redirect(target,301);
    }
    return new Response('指定されたアイテムは見つかりませんでした。',{status:404,headers:{
      'content-type':'text/plain; charset=utf-8','cache-control':'public,max-age=600',
      'x-robots-tag':'noindex'
    }});
  }
  if(isAutoItemDetail || isBriefRareMobDetail) {
    const asset=await env.ASSETS.fetch(request);
    if(asset.status!==200 || !(asset.headers.get('content-type')||'').includes('text/html'))return asset;
    const headers=new Headers(asset.headers);
    headers.set('X-Robots-Tag','noindex, follow');
    headers.delete('Content-Length');
    const outgoing=new Response(asset.body,{status:asset.status,statusText:asset.statusText,headers});
    return new HTMLRewriter()
      .on('head',{element(element){element.append('<meta name="robots" content="noindex,follow">',{html:true});}})
      // Cloudflare serves /item without .html and redirects /item.html there.
      // Keep self-canonical links aligned while preserving noindex on thin pages.
      .on('link[rel="canonical"]',{element(element){
        const href=element.getAttribute('href');
        if(href&&href.startsWith('https://mlabg.com/')&&href.endsWith('.html'))
          element.setAttribute('href',href.slice(0,-5));
      }})
      .on('script[src*="pagead2.googlesyndication.com"]',{element(element){element.remove();}})
      .transform(outgoing);
  }
  return env.ASSETS.fetch(request);
 }
};
