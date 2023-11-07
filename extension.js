'use strict';

/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */


const { Gio, GLib, GObject, St } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;

var TimeToLogIndicator = GObject.registerClass(
    class TimeToLogIndicator extends PanelMenu.Button {
        _init() {
            super._init(0.0, `${Me.metadata.name} Indicator`, false);

            // Pick an icon
            this.icon = new St.Icon({
                style_class: 'system-status-icon',
                icon_name: 'text-editor-symbolic'
            });
            this.actor.add_child(this.icon);

            this.click = this.connect("button-release-event", this._createLogFile.bind(this));
        }

        _createLogFile() {
            const date = new Date();

            const [minute, hour, month, day, year] = [
              date.getMinutes().toString().padStart(2, "0"),
              date.getHours().toString().padStart(2, "0"),
              (date.getMonth() + 1).toString().padStart(2, "0"),
              date.getDate().toString().padStart(2, "0"),
              date.getFullYear(),
            ];
            const date_string = `${year}-${month}-${day}`;
            const time_string = `${hour}${minute}`;

            // TODO(TW): make this path configurable, default to home + Notes
            const log_path = GLib.build_filenamev([
              GLib.get_home_dir(),
              `Notes/${date_string}.md`,
            ]);

            log(`Creating file ${log_path}`);

            const log_file = Gio.File.new_for_path(log_path);

            var file_stream;
            var header = `\n\n## ${time_string}\n- `;

            try {
                file_stream = log_file.create(Gio.FileCreateFlags.NONE, null);
                header = `# ${date_string}` + header;
            }
            // TODO: Is this try/catch necessary? If so, catch relevant error only.
            catch (err) {
                log(`File exists.`);
                file_stream = log_file.append_to(Gio.FileCreateFlags.NONE, null);
            }

            file_stream.write(header, null);

            file_stream.close(null);

            // TODO: Launch note-taking app (Iotas).
        }
    }
);

var indicator = null;

class Extension {
    constructor() {
    }

    enable() {
        log(`enabling ${Me.metadata.name} version ${Me.metadata.version}`);

        indicator = new TimeToLogIndicator();

        Main.panel.addToStatusArea(`${Me.metadata.name} Indicator`, indicator);
    }

    disable() {
        log(`disabling ${Me.metadata.name} version ${Me.metadata.version}`);

        if (indicator !== null) {
            indicator.destroy();
            indicator = null;
        }
    }
}

function init() {
    return new Extension();
}
