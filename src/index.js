import React, {useState, useEffect} from 'react'
import Fetcher, {Router, Client} from 'a-fetch'

class Config {
  constructor() {
    this.Request = Fetcher.request()
    this.setRecords = null
  }

  index(name, params = {}, records = []) {
    const [index, setIndex] = useState(Fetcher.collection())

    useEffect(() => {
      this.Request.index(name, params, records).then(response => setIndex(response))
    }, [])

    return [index, data => setIndex({...index, data})]
  }

  show(name, params = {}) {
    const [show, setShow] = useState(Fetcher.model())

    useEffect(() => {
      this.Request.show(name, params).then(response => {
        setShow(response)

        if (this.setRecords && response.records) {
          this.setRecords(response.records)
        }
      })
    }, [])

    return [show, data => setShow({...show, data})]
  }

  store(name, model = {}) {
    const [store, setStore] = useState({...Fetcher.model(), loading: false, data: model})

    const submit = () => {
      setStore({...store, loading: true})
      return this.Request.store(name, store.data).then(response => {
        setStore({...store, data: model, loading: false})

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

  update(name, params = {}, model = {}) {
    const [update, setUpdate] = useState({...Fetcher.model(), loading: false, data: model})

    useEffect(() => {
      this.Request.show(name, params).then(response => setUpdate(response))
    }, [])

    const submit = () => {
      setUpdate({...update, loading: true})
      return this.Request.update(name, update.data).then(response => {
        setUpdate({...update, loading: false})

        if (this.setRecords && response.records) {
          this.setRecords(response.records)
        }

        return response
      })
    }

    return [
      update,
      (data) => setUpdate({...update, data: {...update.data, ...data}}),
      submit,
    ]
  }

  delete(name, params = {}) {
    const [destroy, setDestroy] = useState({loading: false})

    const submit = (submitParams = {}) => {
      setDestroy({loading: true})
      return this.Request.delete(name, submitParams).then(response => {
        setDestroy({loading: false})

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
    const [login, setLogin] = useState({...Fetcher.model(), loading: false, data: model})

    const submit = () => {
      setLogin({...login, loading: true})
      return this.Request.login(login.data).then(response => {
        setLogin({...login, data: model, loading: false})
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
    const [logout, setLogout] = useState({...Fetcher.model(), loading: false, data: model})

    const submit = () => {
      setLogout({...logout, loading: true})
      return this.Request.logout(logout.data).then(response => {
        setLogout({...logout, data: model, loading: false})
        return response
      })
    }

    return [
      logout,
      (data) => setLogout({...logout, data: {...logout.data, ...data}}),
      submit,
    ]
  }

  records(setRecords, records = [], key = 'id') {
    this.setRecords = setRecords
    this.Request.records(records, key)
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
  return new Config().api(name)
}

export const useBearerToken = (name) => {
  return new Config().bearerToken(name)
}

export const useRecords = (setRecords, records = [], key = 'id') => {
  return new Config().records(setRecords, records, key)
}

export const useIndex = (name, params = {}, records = []) => {
  return new Config().index(name, params, records)
}

export const useShow = (name, params = {}) => {
  return new Config().show(name, params)
}

export const useStore = (name, model = {}) => {
  return new Config().store(name, model)
}

export const useUpdate = (name, params = {}, model = {}) => {
  return new Config().update(name, params, model)
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

export {Router, Client}
export default Fetcher
