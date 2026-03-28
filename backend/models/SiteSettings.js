const mongoose = require('mongoose');

const siteSettingsSchema = mongoose.Schema({
    announcementText: {
        type: String,
        default: '',
    },
    isAnnouncementActive: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
