const SiteSettings = require('../models/SiteSettings');

// @desc    Public: Get site settings
// @route   GET /api/settings
const getSettings = async (req, res) => {
    try {
        let settings = await SiteSettings.findOne();
        if (!settings) {
            settings = await SiteSettings.create({});
        }
        res.json(settings);
    } catch (error) { res.status(500).json({ message: 'Error fetching settings' }); }
};

// @desc    Admin: Update site settings
// @route   PUT /api/settings/admin
const updateSettings = async (req, res) => {
    try {
        const { announcementText, isAnnouncementActive } = req.body;
        let settings = await SiteSettings.findOne();
        if (!settings) {
            settings = await SiteSettings.create({});
        }
        
        settings.announcementText = announcementText;
        settings.isAnnouncementActive = isAnnouncementActive;
        await settings.save();
        
        res.json(settings);
    } catch (error) { res.status(500).json({ message: 'Error updating settings' }); }
};

module.exports = { getSettings, updateSettings };
