'use strict';

const Homey = require('homey');
const { ZigBeeDevice } = require('homey-zigbeedriver');
const { Cluster, CLUSTER } = require('zigbee-clusters');

// Power On Behaviour and Switch Type need these
const SonoffSpecificOnOffCluster = require('../../lib/SonoffSpecificOnOffCluster');
const SonoffSpecificOnOffSwitchCluster = require("../../lib/SonoffSpecificOnOffSwitchCluster");
Cluster.addCluster(SonoffSpecificOnOffCluster);
Cluster.addCluster(SonoffSpecificOnOffSwitchCluster);

class ZBMINIR2 extends ZigBeeDevice {
    
    async onNodeInit({ zclNode }) {

        if (this.hasCapability('onoff')) this.registerCapability('onoff', CLUSTER.ON_OFF, {
        });

    }

    async onSettings(settingsEvent) {

        const newSettings = settingsEvent.newSettings;
        const changedKeys = settingsEvent.changedKeys;

        if (changedKeys.includes('powerOnCtrl_state')) {
            try {
                const powerOnCtrlstate = await this.zclNode.endpoints[1].clusters.onOff.readAttributes(['powerOnCtrl']);
                await this.zclNode.endpoints[11].clusters.onOff.writeAttributes({powerOnCtrl: newSettings.powerOnCtrl_state}); // default: On (On, Off, 255 = Recover)
                this.log("Power On Control supported by device");
            } catch (error) {
                this.log("This device does not support Power On Control");
            }
        };

        if (changedKeys.includes('switch_type')) {
            try {
                const rockerbehavior = await this.zclNode.endpoints[1].clusters.onOff.readAttributes(['switchType']);
                await this.zclNode.endpoints[1].clusters.onOffSwitch.writeAttributes({switchType: newSettings.switch_type});
                this.log("Switch Type supported by device");
            } catch (error) {
                this.log("This device does not support Switch Type");
            }
        };

    }

}

module.exports = ZBMINIR2;