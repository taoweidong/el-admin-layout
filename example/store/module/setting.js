import {getLocalPersonalSettings, setLocalPersonalSettings} from '@example/util/storage'
import {mergeObj} from "@example/util"
import {appMutations, asideMutations, headerMutations, pageMutations, tagsViewMutations} from "el-admin-layout"

const noop = () => undefined

function getLayoutMutationsByType(type) {
    switch (type) {
        case 'app':
            return appMutations
        case 'aside':
            return asideMutations
        case 'header':
            return headerMutations
        case 'page':
            return pageMutations
        case 'tagsView':
            return tagsViewMutations
    }
}

//app.navMode -> commit('setting/app/navMode')
function createMutations(state, mutations = Object.create(null), parentType = '') {
    Object.entries(state).forEach(([k, v]) => {
        const type = parentType ? `${parentType}/${k}` : k

        if (v !== null && typeof v === 'object') {
            return createMutations(v, mutations, type)
        }

        const keys = type.split('/')
        const layoutMutation = (() => {
            const fun = getLayoutMutationsByType(keys[0])[keys[1]]

            //像tagsView中就有两项是没有对应的修改方法的
            return fun ? newVal => fun(newVal) : noop
        })()

        mutations[type] = (s, v) => {
            let val = s[keys[0]]
            for (let i = 1; i < keys.length - 1; i++) {
                val = val[keys[i]]
            }

            const lastKey = keys[keys.length - 1]

            if (val[lastKey] === v) return
            val[lastKey] = v
            layoutMutation(v)
            setLocalPersonalSettings(s)
        }
    })

    return mutations
}

//将此处的设置项数据同步到layout中的store
function syncLayoutStore(state) {
    const {app, page, aside, header, tagsView} = state

    Object.entries(app).forEach(([k, v]) => appMutations[k](v))

    Object.entries(page).forEach(([k, v]) => pageMutations[k](v))

    Object.entries(aside).forEach(([k, v]) => asideMutations[k](v))

    Object.entries(header).forEach(([k, v]) => headerMutations[k](v))

    tagsViewMutations.enabled(tagsView.enabled)
    tagsViewMutations.enableCache(tagsView.enableCache)
}

const state = {
    app: {
        showLogo: true,
        struct: 'left-right',
        navMode: 'mix'
    },
    page: {
        showHeader: true,
        showFooter: true
    },
    aside: {
        theme: 'dark',
        uniqueOpen: true,
        collapse: false,
        showParentOnCollapse: false,
        autoHide: false,
        search: true
    },
    header: {
        theme: 'dark'
    },
    tagsView: {
        enabled: true,
        enableCache: true,
        shortcut: true,
        persistent: true
    }
}

const mutations = createMutations(state)

//将本地存储的数据合并到此处
mergeObj(state, getLocalPersonalSettings())
//由于数据结构可能发生变化，所以在合并后覆盖本地数据
setLocalPersonalSettings(state)

syncLayoutStore(state)

export default {
    namespaced: true,
    state,
    mutations
}