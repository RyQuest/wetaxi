export const environment = {
  production: true,
  // apiUrl: 'https://api.gogotaxiapps.com/admin_v1/',
  // profileImageUrl: 'https://api.gogotaxiapps.com/uploads/profile_picture/large/',
  // vehicleImageUrl: 'https://api.gogotaxiapps.com/uploads/vehicle_photos/large/',
  // vehicleTypeImageUrl: 'https://api.gogotaxiapps.com/uploads/vehicle_types/',
  // countryFlagUrl: 'https://api.gogotaxiapps.com/uploads/country_flags/',

  apiUrl: "http://3.21.49.79:6025/admin_v1/",
  profileImageUrl: "http://3.21.49.79:6025/uploads/profile_picture/large/",
  vehicleImageUrl: "http://3.21.49.79:6025/uploads/vehicle_photos/large/",
  vehicleTypeImageUrl: "http://3.21.49.79:6025/uploads/vehicle_types/",
  countryFlagUrl: "http://3.21.49.79:6025/uploads/country_flags/",
  notification_media_large_url:"http://3.21.49.79:6025/uploads/notification_media/large/",
  reward_media_large_url:"http://3.21.49.79:6025/uploads/reward_media/large/",
  // adminPermission: ["DASHBOARD", "PASSENGER", "DRIVER", "VEHICLE", "HELP_CENTER", "EMERGENCY", "BILLING_PLANS", "OPERATOR", "CREDIT", "DRIVER_RIDE","PASSENGER_RIDE","RIDES_HISTORY","REWARD_HISTORY","SETTING_PERMISSION"],

  apiUrlPromoter: "http://3.21.49.79:6025/promoter/",
  apiUrlVo: "http://3.21.49.79:6025/Vo/",
  adminPermission: [
    "DASHBOARD",
    "DISPATCHER",
    "PASSENGER",
    "CHANGE_PASS",
    "DRIVER",
    "PROMOTION_CODE",
    "REWARD",
    "USER_MANAGEMENT",
    "LOCATION",
    "RECYCLE_BIN",
    "VEHICLE",
    "HELP_CENTER",
    "EMERGENCY",
    "CALL_CENTER",
    "BILLING_PLANS",
    "OPERATOR",
    "VEHILCE_OWNER",
    "CREDIT",
    "DRIVER_RIDE",
    "PASSENGER_RIDE",
    "RIDES_HISTORY",
    "REWARD_HISTORY",
    "SETTING_PERMISSION",
    "HIERARCHY_HISTORY",
    "REFFERAL_EARNING",
    "NOTIFY",
    "ACTION_LOGS",
    "ADMIN",
    "NOTIFICATION_LOGS",
    "LOGOUT_MODAL"
  ],
  operatorPermission: [
    "DASHBOARD",
    "CHANGE_PASS",
    "DRIVER_MANAGEMENT_OWNER",
    "VEHICLE_OWNER_MANAGEMENT",
    "INSURANCE",
    "LOGOUT_MODAL"
  ],
  promoterPermission: [
    "DASHBOARD",
    "CHANGE_PASS",
    "DRIVER_MANAGEMENT_PROMOTER",
    "VEHILCE_OWNER",
    "REFERRAL_HIERARCHY",
    "REFFERAL_EARNING_PROMOTER",
    "LOGOUT_MODAL"
  ],

  // operatorPermission: ["PASSENGER", "DRIVER", "CREDIT"],
  default_map_zoom: 12
};
