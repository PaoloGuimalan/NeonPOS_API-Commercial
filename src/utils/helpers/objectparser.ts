function deleteKeyInObject(givenkey: string, object: any){
    return Object.keys(object).filter(key =>
        key !== givenkey).reduce((obj: any, key) =>
        {
            obj[key] = object[key];
            return obj;
        }, {}
    );
}

export {
    deleteKeyInObject
}