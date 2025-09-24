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

import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import St from 'gi://St';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';

let pillBox, statusArea, network, networkIcon;
let _spacer = null;
let _indicator = null;

export default class TimeToLogExtension extends Extension {
    constructor(metadata) {
        super(metadata);
    }

    enable() {
        log(`enabling ${this.metadata.name} version ${this.metadata.version}`);

        if (!_indicator) {
          _indicator = new TimeToLogIndicator();
        }

        Main.panel.addToStatusArea(`${this.metadata.name} Indicator`, _indicator);

    }

    disable() {
        log(`disabling ${this.metadata.name} version ${this.metadata.version}`);

        if (_indicator) {
            _indicator.destroy();
            _indicator = null;
        }
    }
}

const TimeToLogIndicator = GObject.registerClass(
    {
        GTypeName: "TimeToLogIndicator",
    },
    class TimeToLogIndicator extends PanelMenu.Button {
        _init() {
            super._init({
                y_align: Clutter.ActorAlign.CENTER,
                visible: false,
            });

            this._icon = new St.Icon({
                y_align: Clutter.ActorAlign.CENTER,
                style_class: 'system-status-icon',
                icon_name: 'text-editor-symbolic'
            });

            this.actor.add_child(this._icon);

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

            // Template from from https://gjs.guide/guides/gio/subprocesses.html#basic-usage
            try {
                const proc = Gio.Subprocess.new(
                    // TODO: Iotas has no filename argument; this would be nice
                    ['flatpak', 'run', 'org.gnome.gitlab.cheywood.Iotas'],
                    Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE
                );
            } catch (e) {
                // TODO: Handle errors that are a result of the process failing to start.
                logError(e);
            }
        }
    }
);

