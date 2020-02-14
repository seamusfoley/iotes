export const createDispatcher = (
    name: string,
    type: string,
    dispatch: any,
) => (value: {[key: string]: any}):void => {
    dispatch({
        [name]: { ...value, type, name },
    })
}
