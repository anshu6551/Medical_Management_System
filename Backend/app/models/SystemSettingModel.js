const mongoose = require("mongoose");

const systemSettingSchema = new mongoose.Schema(
  {
    announcement: { type: String, default: "" },
    isMaintenanceMode: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SystemSetting", systemSettingSchema);