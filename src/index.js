import {useState, useEffect} from 'react'
import {Fetcher, Router, Client} from 'a-fetch'
import {get} from 'js-expansion'

class Config {
    constructor(api) {
        this.Request = api ? Fetcher.api(api) : Fetcher.request()
        this.setRecords = null
        this._mapping = {}
        this._data = null
    }

    index(name, params = {}) {
        const [indexParams, setIndexParams] = useState({
            params,
            append: false,
            skip: !!this._data,
        })

        const [index, setIndex] = useState({
            ...Fetcher.collection(),
            data: this._data || Fetcher.collection().data
        })

        useEffect(() => {
            if (indexParams.skip) {
                return
            }

            setIndex({...index, loading: true})
            this.Request.index(name, indexParams.params).then(response => {
                if (indexParams.append) {
                    response.data = index.data.concat(response.data)
                }

                setIndex(response)

                if (this.setRecords && response.records) {
                    this.setRecords(response.records)
                }
            })

        }, [indexParams.params])

        return [
            index,
            data => setIndex({...index, data}),
            indexParams.params,
            (params, append = false) => setIndexParams({params, append, skip: false}),
        ]
    }

    show(name, params = {}) {
        const [showParams, setShowParams] = useState(params)
        const [show, setShow] = useState(Fetcher.model())

        useEffect(() => {
            setShow({...show, loading: true})
            this.Request.show(name, showParams).then(response => {
                setShow(response)

                if (this.setRecords && response.records) {
                    this.setRecords(response.records)
                }
            })
        }, [showParams])

        return [show, data => setShow({...show, data}), showParams, setShowParams]
    }

    store(name, model = {}) {
        const [store, setStore] = useState({
            ...Fetcher.model(),
            loading: false,
            data: model,
            submitting: false,
        })

        const submit = (submitParams = {}) => {
            setStore({...store, submitting: true})
            return this.Request.store(name, {...store.data, ...submitParams}).then(response => {
                setStore({
                    ...store,
                    ...response,
                    data: response.errors.length ? store.data : model,
                    submitting: false
                })

                if (this.setRecords && response.records) {
                    this.setRecords(response.records)
                }

                return response
            })
        }

        return [
            store,
            (data) => setStore({...store, data: {...store.data, ...data}}),
            submit,
        ]
    }

    update(name, model = {}, params = {}) {
        const hasParams = Object.keys(params).length
        const [update, setUpdate] = useState({...Fetcher.model(), loading: hasParams, data: model})
        const updateData = (data) => setUpdate({
            ...update,
            loading: false,
            submitting: false,
            data: {...update.data, ...data},
        })

        if (hasParams) {
            useEffect(() => {
                this.Request.show(name, params).then(response => {
                    const data = {}

                    Object.keys(model).map((name) => {
                        if (this._mapping[name]) {
                            if (typeof this._mapping[name] === 'function') {
                                data[name] = this._mapping[name](response.data)
                            } else {
                                data[name] = get(response.data, this._mapping[name]) || ''
                            }
                        } else if (response.data.hasOwnProperty(name)) {
                            data[name] = response.data[name]
                        }
                    })

                    updateData(data)
                })
            }, [])
        }

        const submit = (submitParams = {}) => {
            setUpdate({...update, submitting: true})
            return this.Request.update(name, {...update.data, ...submitParams}).then(response => {
                setUpdate({...update, ...response, data: update.data, submitting: false})

                if (this.setRecords && response.records) {
                    this.setRecords(response.records)
                }

                return response
            })
        }

        return [
            update,
            updateData,
            submit,
        ]
    }

    delete(name, params = {}) {
        const [destroy, setDestroy] = useState({loading: false, submitting: false})

        const submit = (submitParams = {}) => {
            setDestroy({submitting: true})
            return this.Request.delete(name, {...params, ...submitParams}).then(response => {
                setDestroy({submitting: false})

                if (this.setRecords && response.records) {
                    this.setRecords(response.records)
                }

                return response
            })
        }

        return [
            destroy,
            submit,
        ]
    }

    login(model) {
        const [login, setLogin] = useState({
            ...Fetcher.model(),
            loading: false,
            submitting: false,
            data: model
        })

        const submit = () => {
            setLogin({...login, submitting: true})
            return this.Request.login(login.data).then(response => {
                const data = response.errors.length ? login.data : model
                setLogin({...login, ...response, data, submitting: false})
                return response
            })
        }

        return [
            login,
            (data) => setLogin({...login, data: {...login.data, ...data}}),
            submit,
        ]
    }

    logout(model) {
        const [logout, setLogout] = useState({
            ...Fetcher.model(),
            loading: false,
            submitting: false,
            data: model
        })

        const submit = () => {
            setLogout({...logout, submitting: true})
            return this.Request.logout(logout.data).then(response => {
                setLogout({...logout, ...response, data: model, submitting: false})
                return response
            })
        }

        return [
            logout,
            (data) => setLogout({...logout, data: {...logout.data, ...data}}),
            submit,
        ]
    }

    data(data) {
        this._data = data
        return this
    }

    records(setRecords = null, records = [], key = 'id') {
        this.setRecords = setRecords
        this.Request.records(records, key)
        return this
    }

    mapping(mapping = {}) {
        this._mapping = mapping
        return this
    }

    api(api) {
        this.Request.api(api)
        return this
    }

    bearerToken(bearer_token) {
        this.Request.bearerToken(bearer_token)
        return this
    }
}

export const useApi = (name) => {
    return new Config(name)
}

export const useBearerToken = (name) => {
    return new Config().bearerToken(name)
}

export const useRecords = (setRecords = null, records = [], key = 'id') => {
    return new Config().records(setRecords, records, key)
}

export const useData = (data) => {
    return new Config().data(data)
}

export const useMapping = (mapping = {}) => {
    return new Config().mapping(mapping)
}

export const useIndex = (name, params = {}) => {
    return new Config().index(name, params)
}

export const useShow = (name, params = {}) => {
    return new Config().show(name, params)
}

export const useStore = (name, model = {}) => {
    return new Config().store(name, model)
}

export const useUpdate = (name, model = {}, params = {}) => {
    return new Config().update(name, model, params)
}

export const useDelete = (name, params = {}) => {
    return new Config().delete(name, params)
}

export const useLogin = (model = {}) => {
    return new Config().login(model)
}

export const useLogout = (model = {}) => {
    return new Config().logout(model)
}

export {Fetcher, Router, Client}
