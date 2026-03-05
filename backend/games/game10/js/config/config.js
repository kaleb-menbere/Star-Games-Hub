function config() { }
config.settings = {
	"SWIT_VERSION": "1.2.0",
	"GAME_NAME": "Spider-Man: Mysterio Rush",
	"MAX_DELTA_TIME": 50,
	"SAFE_AREA_WIDTH": 200,
	"APP_WIDTH": 1024,
	"APP_HEIGHT": 768,
	"APP_FPS": 40,
	"SOUND_PERCENT": 20,
	"ASSETS_PATH": "",
	"LOG": true,
	"USE_TILT": true,
	"RENDER_MODE": 0,
	"CONSOLE_MODE": 2,
	"WIDE_SCREEN": true,
	"RIGHT_TO_LEFT": false,
	"SHOW_SOCIAL_BUTTONS": false,
	"USE_ONLY_SOUNDJS": false,
	"ALL_UNLOCKED_LEVELS": false,
	"keyUp": 38,
	"keyDown": 40,
	"keyRight": 39,
	"keyLeft": 37,
	"keySpace": 32,
	"percentage_enemy_hit": [6.26,7.15,8.34,10.01],
	"percentage_ring": [18.78,21.45,25.02,30.03],
	"timeCombo": 8
};
config.sounds = [
	{
		"id": "MUSIC_MAINMENU",
		"file": "music_main_menu",
		"loops": 0,
		"vol": 0.8,
		"ios": 1,
		"instances": 1,
		"group": 0
	},
	{
		"id": "MUSIC_GAME_CENTRALPARK",
		"file": "music_game_central_park",
		"loops": 0,
		"vol": 0.5,
		"ios": 1,
		"instances": 1,
		"group": 1
	},
	{
		"id": "MUSIC_GAME_MANHATTAN",
		"file": "music_game_manhattan",
		"loops": 0,
		"vol": 0.5,
		"ios": 1,
		"instances": 1,
		"group": 1
	},
	{
		"id": "MUSIC_GAME_QUEENS",
		"file": "music_game_queens",
		"loops": 0,
		"vol": 0.5,
		"ios": 1,
		"instances": 1,
		"group": 1
	},
	{
		"id": "MUSIC_GAME_TIMESQUARE",
		"file": "music_game_times_square",
		"loops": 0,
		"vol": 0.5,
		"ios": 1,
		"instances": 1,
		"group": 1
	},
	{
		"id": "MUSIC_GAME_BOSS",
		"file": "music_boss",
		"loops": 0,
		"vol": 0.5,
		"ios": 1,
		"instances": 1,
		"group": 1
	},
	{
		"id": "SND_UI_SCENARIO_THUNDER",
		"file": "snd_scenario_thunder",
		"loops": 1,
		"vol": 0.1,
		"ios": 0,
		"instances": 1,
		"group": 0
	},
	{
		"id": "SND_UI_CLICK",
		"file": "snd_ui_button",
		"loops": 1,
		"vol": 0.6,
		"ios": 0,
		"instances": 1,
		"group": 0
	},
	{
		"id": "SND_UI_PLAY",
		"file": "snd_ui_play",
		"loops": 1,
		"vol": 0.6,
		"ios": 0,
		"instances": 1,
		"group": 0
	},
	{
		"id": "SND_PLAYER_SWING",
		"file": "snd_player_swing",
		"loops": 1,
		"vol": 0.5,
		"ios": 0,
		"instances": 1,
		"group": 1
	},
	{
		"id": "SND_PLAYER_HIT",
		"file": "snd_player_hit",
		"loops": 1,
		"vol": 0.8,
		"ios": 0,
		"instances": 1,
		"group": 1
	},
	{
		"id": "SND_PLAYER_SHIELD",
		"file": "snd_player_shield",
		"loops": 1,
		"vol": 0.8,
		"ios": 0,
		"instances": 1,
		"group": 1
	},
	{
		"id": "SND_PLAYER_STYLISH",
		"file": "snd_player_stylish",
		"loops": 1,
		"vol": 0.8,
		"ios": 0,
		"instances": 1,
		"group": 1
	},
	{
		"id": "SND_POWERUPS_DRONE_ACTIVE",
		"file": "snd_powerups_drone_activate",
		"loops": 1,
		"vol": 0.8,
		"ios": 0,
		"instances": 1,
		"group": 1
	},
	{
		"id": "SND_POWERUPS_DRONE_DEACTIVE",
		"file": "snd_powerups_drone_deactivate",
		"loops": 1,
		"vol": 0.8,
		"ios": 0,
		"instances": 1,
		"group": 1
	},
	{
		"id": "SND_POWERUPS_DRONE_LOOP",
		"file": "snd_powerups_drone_loop",
		"loops": 0,
		"vol": 0.5,
		"ios": 1,
		"instances": 1,
		"group": 1
	},
	{
		"id": "SND_POWERUPS_RINGBOOST",
		"file": "snd_powerups_ringboost",
		"loops": 1,
		"vol": 0.7,
		"ios": 0,
		"instances": 1,
		"group": 1
	},
	{
		"id": "SND_POWERUPS_SPIDEYCOINS",
		"file": "snd_powerups_spideycoins",
		"loops": 1,
		"vol": 0.4,
		"ios": 0,
		"instances": 10,
		"group": 1
	},
	{
		"id": "SND_POWERUPS_MAGNET",
		"file": "snd_powerups_magnet",
		"loops": 1,
		"vol": 0.8,
		"ios": 0,
		"instances": 2,
		"group": 1
	},
	{
		"id": "SND_ENEMIES_EXPLO_EXPLODES",
		"file": "snd_enemies_exploding_explodes",
		"loops": 1,
		"vol": 0.7,
		"ios": 0,
		"instances": 2,
		"group": 1
	},
	{
		"id": "SND_ENEMIES_EXPLO_HIT",
		"file": "snd_enemies_exploding_hit",
		"loops": 1,
		"vol": 0.5,
		"ios": 0,
		"instances": 3,
		"group": 1
	},
	{
		"id": "SND_ENEMIES_NORMAL_DIE",
		"file": "snd_enemies_normal_die",
		"loops": 1,
		"vol": 0.8,
		"ios": 0,
		"instances": 2,
		"group": 1
	},
	{
		"id": "SND_ENEMIES_NORMAL_HIT",
		"file": "snd_enemies_normal_hit",
		"loops": 1,
		"vol": 0.8,
		"ios": 0,
		"instances": 2,
		"group": 1
	},
	{
		"id": "SND_ENEMIES_SHOOTING_DIE",
		"file": "snd_enemies_shooting_die",
		"loops": 1,
		"vol": 0.8,
		"ios": 0,
		"instances": 2,
		"group": 1
	},
	{
		"id": "SND_ENEMIES_SHOOTING_SHOOT",
		"file": "snd_enemies_shooting_shoot",
		"loops": 1,
		"vol": 0.6,
		"ios": 0,
		"instances": 2,
		"group": 1
	},
	{
		"id": "SND_HAZARDS_ALERT",
		"file": "snd_hazards_alert",
		"loops": 1,
		"vol": 0.5,
		"ios": 0,
		"instances": 1,
		"group": 1
	},
	{
		"id": "SND_HAZARDS_GASBOMBS",
		"file": "snd_hazards_gasbombs",
		"loops": 1,
		"vol": 0.8,
		"ios": 0,
		"instances": 2,
		"group": 1
	},
	{
		"id": "SND_HAZARDS_GASROCKETS",
		"file": "snd_hazards_gasrockets",
		"loops": 1,
		"vol": 0.8,
		"ios": 0,
		"instances": 2,
		"group": 1
	},
	{
		"id": "SND_HAZARDS_GASROCKETS_LAUNCH",
		"file": "snd_hazards_gasrockets_launch",
		"loops": 1,
		"vol": 1,
		"ios": 0,
		"instances": 2,
		"group": 1
	},
	{
		"id": "SND_SCN_CHANGE",
		"file": "snd_scn_change",
		"loops": 1,
		"vol": 1,
		"ios": 0,
		"instances": 1,
		"group": 1
	},
	{
		"id": "SND_BOSS_DEFEAT",
		"file": "snd_boss_defeat",
		"loops": 1,
		"vol": 0.8,
		"ios": 0,
		"instances": 2,
		"group": 1
	},
	{
		"id": "SND_BOSS_HIT",
		"file": "snd_boss_hit",
		"loops": 1,
		"vol": 0.8,
		"ios": 0,
		"instances": 2,
		"group": 1
	},
	{
		"id": "SND_BOSS_LASER_LOAD",
		"file": "snd_boss_laser_load",
		"loops": 1,
		"vol": 0.8,
		"ios": 0,
		"instances": 2,
		"group": 1
	},
	{
		"id": "SND_BOSS_LASER_SHOOT",
		"file": "snd_boss_laser_shoot",
		"loops": 1,
		"vol": 0.8,
		"ios": 0,
		"instances": 2,
		"group": 1
	},
	{
		"id": "SND_BOSS_ROCKET_LOAD",
		"file": "snd_boss_rocket_load",
		"loops": 1,
		"vol": 0.8,
		"ios": 0,
		"instances": 2,
		"group": 1
	},
	{
		"id": "SND_BOSS_ROCKET_SHOOT",
		"file": "snd_boss_rocket_shoot",
		"loops": 1,
		"vol": 0.6,
		"ios": 0,
		"instances": 2,
		"group": 1
	},
	{
		"id": "SND_BOSS_ROCKET_SUMMON",
		"file": "snd_boss_summon",
		"loops": 1,
		"vol": 0.8,
		"ios": 0,
		"instances": 2,
		"group": 1
	}
];
config.browserSettings = [
	{
		"browserType": "MSIE",
		"platformType": "Win",
		"minVersion": 9
	},
	{
		"browserType": "Opera",
		"platformType": "",
		"minVersion": 12
	},
	{
		"browserType": "Chrome",
		"platformType": "",
		"minVersion": 25
	},
	{
		"browserType": "Firefox",
		"platformType": "",
		"minVersion": 20
	},
	{
		"browserType": "Safari",
		"platformType": "",
		"minVersion": 4
	}
];
config.player = {
	"swingSpeed": [-0.0011,-0.0012,-0.0013,-0.0014],
	"swingAcceleration": [-0.15,-0.16,-0.17,-0.17],
	"limitCteAngularAcceleration": [-0.018,-0.0185,-0.019,-0.020],
	"dashSpeed": [3,3,3,3],
	"dashAcceleration": [-30,-30,-30,-30],
	"dashMinSpeedToEnd": [1.5,1.5,1.5,1.5],
	"metersMultiplier": [0.5,1,1.5,2],
	"radiusDecreaseSpeed": [-0.3,-0.33,-0.37,-0.4],
	"timeVehicleAppear": [60000,60000,50000,40000],
	"coinMultiplier": [1,1.5,2,3],
	"distanceUpgradeLevel": [250,750],
	"gravity": 13,
	"pivotRect": [450,-100,0,0],
	"limitRadiusMin": 300,
	"fixMinAngleReleaseSwing": 0,
	"fixMaxAngleReleaseSwing": 25,
	"limitYForceRelease": 250,
	"limitAngleForceRelease": 1.1,
	"glideSpeed": 1.5,
	"glideAcc": 0.75,
	"glideTimeLife": 10000,
	"magnetTimeAppear": 45000,
	"magnetTimeDuration": 10000,
	"stylishBarClicksToFill": 17,
	"stylishBarTimeLife": 2500,
	"stylishMoveParams": [2.5,5]
};
config.enemys = {
	"rocket_speed": 0.5,
	"rocket_distance": 2000,
	"rocket_offSetX": -400,
	"skull_speed": 1.8,
	"skull_distance": 1200,
	"bullet_speed": 0.5,
	"bullet_timeALive": 1.5,
	"bullet_distance_shoot": 1000
};
config.dialogues = [
	{
		"idData": "DIAG_BOSS",
		"title": "STR_REP_DIALOGUE_NAME02",
		"string": "STR_REP_DIALOGUE_INFO_1",
		"side": 2
	},
	{
		"idData": "DIAG_BOSS",
		"title": "STR_REP_DIALOGUE_NAME02",
		"string": "STR_REP_DIALOGUE_INFO_2",
		"side": 2
	},
	{
		"idData": "DIAG_BOSS",
		"title": "STR_REP_DIALOGUE_NAME01",
		"string": "STR_REP_DIALOGUE_INFO_3",
		"side": 1
	},
	{
		"idData": "DIAG_BOSS",
		"title": "STR_REP_DIALOGUE_NAME02",
		"string": "STR_REP_DIALOGUE_INFO_4",
		"side": 2
	}
];
config.achievements = [
	{
		"idSaveData": 1,
		"type": "enemy",
		"objective": 100
	},
	{
		"idSaveData": 2,
		"type": "travel",
		"objective": 3000
	},
	{
		"idSaveData": 3,
		"type": "stylish",
		"objective": 10
	},
	{
		"idSaveData": 4,
		"type": "mysterio",
		"objective": 1
	},
	{
		"idSaveData": 5,
		"type": "combo",
		"objective": 20
	},
	{
		"idSaveData": 6,
		"type": "mysterio_real",
		"objective": 1
	}
];
config.missions = [
	{
		"idSaveData": 1,
		"type": "enemy",
		"objective": 5,
		"condition": "none",
		"supportsHit": true,
		"local": true
	},
	{
		"idSaveData": 2,
		"type": "travel",
		"objective": 150,
		"condition": "none",
		"supportsHit": true,
		"local": true
	},
	{
		"idSaveData": 3,
		"type": "ring",
		"objective": 1,
		"condition": "none",
		"supportsHit": true,
		"local": true
	},
	{
		"idSaveData": 4,
		"type": "bounce",
		"objective": 3,
		"condition": "none",
		"supportsHit": true,
		"local": true
	},
	{
		"idSaveData": 5,
		"type": "combo",
		"objective": 5,
		"condition": "none",
		"supportsHit": true,
		"local": true
	},
	{
		"idSaveData": 6,
		"type": "coins",
		"objective": 100,
		"condition": "none",
		"supportsHit": true,
		"local": true
	},
	{
		"idSaveData": 7,
		"type": "acrobatics",
		"objective": 1,
		"condition": "stylish",
		"supportsHit": true,
		"local": true
	},
	{
		"idSaveData": 8,
		"type": "enemy",
		"objective": 15,
		"condition": "none",
		"supportsHit": true,
		"local": false
	},
	{
		"idSaveData": 9,
		"type": "travel",
		"objective": 500,
		"condition": "none",
		"supportsHit": true,
		"local": true
	},
	{
		"idSaveData": 10,
		"type": "drone",
		"objective": 1,
		"condition": "none",
		"supportsHit": true,
		"local": true
	},
	{
		"idSaveData": 11,
		"type": "coins_total",
		"objective": 1000,
		"condition": "none",
		"supportsHit": true,
		"local": false
	},
	{
		"idSaveData": 12,
		"type": "bounce",
		"objective": 10,
		"condition": "none",
		"supportsHit": true,
		"local": false
	},
	{
		"idSaveData": 13,
		"type": "ring",
		"objective": 3,
		"condition": "none",
		"supportsHit": true,
		"local": true
	},
	{
		"idSaveData": 14,
		"type": "acrobatics",
		"objective": 3,
		"condition": "stylish",
		"supportsHit": true,
		"local": false
	},
	{
		"idSaveData": 15,
		"type": "travel",
		"objective": 1000,
		"condition": "none",
		"supportsHit": true,
		"local": true
	},
	{
		"idSaveData": 16,
		"type": "combo",
		"objective": 10,
		"condition": "none",
		"supportsHit": true,
		"local": true
	},
	{
		"idSaveData": 17,
		"type": "coins",
		"objective": 250,
		"condition": "none",
		"supportsHit": true,
		"local": true
	},
	{
		"idSaveData": 18,
		"type": "enemy",
		"objective": 10,
		"condition": "none",
		"supportsHit": true,
		"local": true
	},
	{
		"idSaveData": 19,
		"type": "ring",
		"objective": 7,
		"condition": "none",
		"supportsHit": true,
		"local": false
	},
	{
		"idSaveData": 20,
		"type": "travel",
		"objective": 750,
		"condition": "none",
		"supportsHit": false,
		"local": true
	},
	{
		"idSaveData": 21,
		"type": "acrobatics",
		"objective": 2,
		"condition": "stylish",
		"supportsHit": true,
		"local": true
	},
	{
		"idSaveData": 22,
		"type": "combo",
		"objective": 15,
		"condition": "none",
		"supportsHit": true,
		"local": true
	},
	{
		"idSaveData": 23,
		"type": "ring",
		"objective": 3,
		"condition": "none",
		"supportsHit": true,
		"local": true
	},
	{
		"idSaveData": 24,
		"type": "enemy",
		"objective": 20,
		"condition": "none",
		"supportsHit": true,
		"local": true
	},
	{
		"idSaveData": 25,
		"type": "travel",
		"objective": 2000,
		"condition": "none",
		"supportsHit": true,
		"local": true
	}
];
config.upgrades = [
	{
		"idSaveData": 1,
		"type": "speed",
		"price": [100,700,1500],
		"maxUpgrade": 3
	},
	{
		"idSaveData": 2,
		"type": "acrobatics",
		"price": [300,800,1300],
		"maxUpgrade": 3
	},
	{
		"idSaveData": 3,
		"type": "luck",
		"price": [200,600,1000],
		"maxUpgrade": 3
	},
	{
		"idSaveData": 4,
		"type": "attack",
		"price": [200,500,1000],
		"maxUpgrade": 3
	},
	{
		"idSaveData": 5,
		"type": "shield",
		"price": [250,1000,3000],
		"maxUpgrade": 3
	}
];
config.boss_attack_hand = [
	{
		"pattern": [1,3,1],
		"frecuency": 1800,
		"timeStandHand": 1,
		"speedHand": 3
	},
	{
		"pattern": [2,3,1,2,1],
		"frecuency": 1550,
		"timeStandHand": 1,
		"speedHand": 3.5
	},
	{
		"pattern": [3,2,1,2,3,2,1,2],
		"frecuency": 1300,
		"timeStandHand": 1,
		"speedHand": 4
	}
];
config.boss_attack_laser = [
	{
		"repeats": 2,
		"timeFollow": 1500,
		"speedFollow": 0.2,
		"timeAttack": 500
	},
	{
		"repeats": 3,
		"timeFollow": 1300,
		"speedFollow": 0.3,
		"timeAttack": 600
	},
	{
		"repeats": 4,
		"timeFollow": 900,
		"speedFollow": 0.4,
		"timeAttack": 700
	}
];
