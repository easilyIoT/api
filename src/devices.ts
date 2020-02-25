import { DeviceAction, DeviceType, DeviceRead } from './types';

export interface DeviceDataStorage {
        actions: DeviceAction[],
        reads: DeviceRead[]
}

const devicesData = new Map<DeviceType, DeviceDataStorage>([
        ["LockController", {
                actions: ["lock", "unlock"],
                reads: ["health"]
        }],
        ["TemperatureSensor", {
                actions: [],
                reads: ["health", "temperature"]
        }]
]);

export default devicesData;

export const isRead = (toBeValidated: DeviceRead): boolean => {
        let res = false;
        
        const values = devicesData.values();
        let dato: IteratorResult<DeviceDataStorage, DeviceDataStorage>;

        while (!(dato = values.next()).done)
                if (dato.value.reads.includes(toBeValidated))
                        res = true
        

        return res;
}

export const isAction = (toBeValidated: DeviceAction): boolean => {
        let res = false;
        
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