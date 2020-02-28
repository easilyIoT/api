import { DeviceAction, DeviceType, DeviceRead, DeviceCategory } from './types';

export interface DeviceDataStorage {
        actions: DeviceAction[],
        reads: DeviceRead[],
        category: DeviceCategory[]
}

const devicesData = new Map<DeviceType, DeviceDataStorage>([
        ["LockController", {
                actions: ["lock", "unlock"],
                reads: ["health"],
                category: ["SMARTLOCK"]
        }],
        ["TemperatureSensor", {
                actions: [],
                reads: ["health", "temperature"],
                category: ["TEMPERATURE_SENSOR"]
        }],
        ["ThermostatController", {
                actions: ["setTemperature"],
                reads: ["health"],
                category: ["THERMOSTAT"]
        }],
        ["PowerController", {
                actions: ["turnON", "turnOFF"],
                reads: ["health"],
                category: ["SWITCH"]
        }]
]);

export default devicesData;

export const isReadType = (toBeValidated: string): toBeValidated is DeviceRead => {
        const casted = toBeValidated as DeviceRead;
        
        if (casted === "health" || casted === "temperature")
                return true;
        else return false;
};

export const isActionType = (toBeValidated: string): toBeValidated is DeviceAction => {
        const casted = toBeValidated as DeviceAction;
        
        if (casted === "lock" || casted === "unlock" || casted === "turnON" || casted === "turnOFF" || casted === "setTemperature")
                return true;
        else return false;
};

export const isRead = (toBeValidated: string): boolean => {
        let res = false;
        
        if (!isReadType(toBeValidated))
                return false;
        
        
        const values = devicesData.values();
        let dato: IteratorResult<DeviceDataStorage, DeviceDataStorage>;

        while (!(dato = values.next()).done)
                if (dato.value.reads.includes(toBeValidated))
                        res = true
        
        return res;
}

export const isAction = (toBeValidated: string): boolean => {
        let res = false;
        
        if (!isActionType(toBeValidated))
                return false;
        
        
        const values = devicesData.values();
        let dato: IteratorResult<DeviceDataStorage, DeviceDataStorage>;

        while (!(dato = values.next()).done) {
                if (dato.value.actions.includes(toBeValidated))
                        res = true
        }

        return res;
}

export const getImplementedTypes = (): DeviceType[] => {
        let res: DeviceType[] = [];

        const keys = devicesData.keys();
        let type: IteratorResult<DeviceType, DeviceType>;

        while (!(type = keys.next()).done)
                res.push(type.value);

        return res;
}