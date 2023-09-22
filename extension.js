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


const { Gio, GObject, St } = imports.gi;

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
                icon_name: 'editor-symbolic'
            });
            this.actor.add_child(this.icon);

            this.click = this.connect("button-release-event", this._createLogFile.bind(this));
        }

        _createLogFile() {
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
