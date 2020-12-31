/**
 * 多页签的响应式数据
 */
import Vue from 'vue'
import {getters as pageGetters, mutations as pageMutations} from "./page"
import {createGetters, createMutations} from "./util"
import {bindThis, getRouterViewCacheKey} from "el-admin-layout/src/util"

const state = {
    //是否启用
    enabled: true,
    //是否启用缓存功能
    enableCache: true,

    //显示的页签，vue-router的routeConfig对象数组
    visitedViews: [],

    //缓存的页签，用于<keep-router-view-alive/>:include
    cachedViews: []
}

const store = Vue.observable(state)

export const getters = createGetters(store)

export const mutations = bindThis({
    ...createMutations(store),

    /**
     * 多页签的启用/停用
     * 停用时会移除所有缓存，并且重置路由过渡动画
     * @param v {boolean} 启用为true，停用为false
     */
    enabled(v) {
        store.enabled = v

        if (!v) {
            pageMutations.transition({curr: pageGetters.transition.default})
            this.delAllTagAndCache()
        }
    },

    /**
     * 多页签缓存功能的启用/停用
     * 停用时会移除所有缓存
     * @param v
     */
    enableCache(v) {
        store.enableCache = v
        !v && this.delAllCache()
    },

    /**
     * 在页签栏上添加一个页签，path已存在的不会重复添加，调用时需要保证meta.title有值
     * @param view
     */
    addTagOnly(view) {
        const {name, path, fullPath, meta} = view

        if (store.visitedViews.some(v => v.path === path)) {
            return
        }

        store.visitedViews.push({name, path, fullPath, meta: {...meta}})
    },

    /**
     * 将传入的routeConfig加入<keep-router-view-alive>的缓存中
     * 以下调用无效：设置了不缓存、是iframe页、未设置唯一标识、已缓存
     * @param view
     */
    addCacheOnly(view) {
        const {noCache, iframe, usePathKey, useFullPathKey} = view.meta || {}

        if (noCache || iframe || !view.name && !usePathKey && !useFullPathKey) {
            return
        }

        const key = getRouterViewCacheKey(view)

        if (store.cachedViews.includes(key)) {
            return
        }

        store.cachedViews.push(key)
    },

    /**
     * 同时调用{@link #addTagOnly}、{@link #addCacheOnly}
     * @param view
     */
    addTagAndCache(view) {
        this.addTagOnly(view)
        this.addCacheOnly(view)
    },

    /**
     * 根据path从页签栏中移除一个页签
     * @param view {path}，routeConfig
     */
    delTagOnly(view) {
        const index = store.visitedViews.findIndex(i => i.path === view.path)
        index > -1 && store.visitedViews.splice(index, 1)
    },

    /**
     * 删除<keep-router-view-alive>对应的缓存
     * @param view
     */
    delCacheOnly(view) {
        const key = getRouterViewCacheKey(view)
        const index = store.cachedViews.indexOf(key)
        index > -1 && store.cachedViews.splice(index, 1)
    },

    /**
     * 同时调用{@link #delTagOnly}、{@link #delCacheOnly}，移除iframe页
     * @param view
     */
    delTagAndCache(view) {
        this.delTagOnly(view)
        this.delCacheOnly(view)

        const iframe = view.meta && view.meta.iframe
        iframe && pageMutations.delIframe(iframe)
    },

    /**
     * 从页签栏上移除除了routeConfig以外的所有非固定页签
     * 并且从<keep-router-view-alive>中移除除了routeConfig以外的所有缓存
     * @param view
     */
    delOtherTagAndCache(view) {
        const visitedViews = store.visitedViews.filter(v => v.meta.affix || v.path === view.path)
        const key = store.cachedViews.find(key => key === getRouterViewCacheKey(view))

        store.visitedViews = visitedViews
        store.cachedViews = key ? [key] : []
    },

    /**
     * 移除<keep-router-view-alive>的所有缓存
     */
    delAllCache() {
        store.cachedViews = []
    },

    /**
     * 从页签栏上移除所有非固定页签，并且移除<keep-router-view-alive>的所有缓存
     */
    delAllTagAndCache() {
        store.visitedViews = store.visitedViews.filter(tag => tag.meta && tag.meta.affix)
        this.delAllCache()
    }
})
