import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';

import {ExtensionPreferences, gettext as _} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class TimeToLogPreferences extends ExtensionPreferences {
    fillPreferencesWindow(prefsWindow) {
        // Create a preferences page, with a single group
        const prefsPage = new Adw.PreferencesPage({
            title: _('General'),
            icon_name: 'preferences-other-symbolic',
        });
        prefsWindow.add(prefsPage);

        const prefsGroup = new Adw.PreferencesGroup({
            title: _('Preferences'),
        });
        prefsPage.add(prefsGroup);

        // Create a preferences row
        //window._settings = this.getSettings();
        const notesDirRow = new Adw.EntryRow({
            title: _('Notes directory')
        });
        prefsGroup.add(notesDirRow);

/*
        editorRow.connect('notify::selected', (widget) => {
            window._settings.set_enum('text_editor', widget.selected);
        });
        */
    }
}

