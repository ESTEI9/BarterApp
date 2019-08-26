import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class CommonService {

    constructor() { }

    async addData(oldData: any, newData: any) {
        const dataset = oldData;
        const oldIds = oldData.map((row: any) =>  row.trade_id);
        const newIds = newData.map((row: any) => row.trade_id);
        const addIds = newIds.filter((newId: any) => !oldIds.includes(newId));

        for (const id of addIds) {
            for (const row of newData) {
                if (row.trade_id === id) {
                    dataset.unshift(row);
                }
            }
        }
        return await dataset;
    }

    async removeData(oldData: any, newData: any) {
        const dataset = oldData;
        const oldIds = oldData.map((row: any) => row.trade_id);
        const newIds = newData.map((row: any) => row.trade_id);
        const removeIds = oldIds.filter((oldId: any) => !newIds.includes(oldId));

        for (const id of removeIds) {
            for (let i = 0; i < dataset.length; i++) {
                if (dataset[i].trade_id === id) {
                    dataset.splice(i, 1);
                }
            }
        }
        return await dataset;
    }

    async changeData(oldData: any, newData: any) {
        const dataSet = oldData;
        for (let i = 0; i < oldData.length; i++) {
            if (JSON.stringify(oldData[i]) !== JSON.stringify(newData[i])) {
                dataSet.splice(i, 1, newData[i]);
            }
        }

        return await dataSet;
    }
}
