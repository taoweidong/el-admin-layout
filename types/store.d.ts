import {Route, RawLocation} from 'vue-router'
import {MenuItem} from "./menu";
import {RouteMeta} from "./route";

type Mutation<T> = (val: T) => void



interface AppGetters {
    isMobile: boolean
    title: string
    logo: string
    logoRoute: RawLocation
    showLogo: boolean
    activeRootMenu: string
    menus: MenuItem[]
    struct: 'top-bottom' | 'left-right'
    navMode: 'aside' | 'mix' | 'head'
}

type AppMutations = { [K in keyof AppGetters]: Mutation<AppGetters[K]> }



interface AsideGetters {
    show: boolean
    theme: 'light' | 'dark'
    uniqueOpen: boolean
    collapse: boolean
    showParentOnCollapse: boolean
    autoHide: boolean
    alwaysRender: boolean
    postMenus: (menus: MenuItem[]) => MenuItem[]
    inlineIndent: number
    switchTransitionName: string
}

type BaseAsideMutations = { [K in keyof AsideGetters]: Mutation<AsideGetters[K]> }

type AsideMutations = BaseAsideMutations & {
    open: () => void
    close: () => void
    switch: (action?: 'open' | 'close') => void
}



interface DropdownItem {
    icon?: string
    content: string
    handler: (e: Event) => any
}

interface HeaderGetters {
    theme: 'light' | 'dark'
    avatar: string
    username: string
    dropdownItems: DropdownItem[]
}

type HeaderMutations = { [K in keyof HeaderGetters]: Mutation<HeaderGetters[K]> }



interface PageGetters {
    transition: {
        default?: string
        next?: string
        prev?: string
        curr?: string
    }
    showIframe: boolean
    currentIframe: string
    iframeList: string[]
    showHeader: boolean
    showFooter: boolean
}

type BasePageMutations = { [K in keyof PageGetters]: Mutation<PageGetters[K]> }

type PageMutations = BasePageMutations & {
    addIframe: (src: string) => void
    delIframe: (src: string) => void
    openIframe: (src: string) => void
    closeIframe: (src: string, del?: boolean) => void
}



interface View extends Route {
    meta: RouteMeta
}

interface VisitedView extends View {
    key: string
}

interface TagsViewGetters {
    enabled: boolean
    enableCache: boolean
    visitedViews: VisitedView[]
    cachedViews: string[]
}

type BaseTagsViewMutations = { [K in keyof TagsViewGetters]: Mutation<TagsViewGetters[K]> }

type TagsViewMutations = BaseTagsViewMutations & {
    addTagOnly: Mutation<View>
    addCacheOnly: Mutation<View>
    addTagAndCache: Mutation<View>
    delTagOnly: Mutation<View>
    delCacheOnly: Mutation<View>
    delTagAndCache: Mutation<View>
    delOtherTagAndCache: Mutation<View>
    delAllCache: () => void
    delAllTagAndCache: () => void
}



export const appGetters: AppGetters
export const appMutations: AppMutations
export const asideGetters: AsideGetters
export const asideMutations: AsideMutations
export const headerGetters: HeaderGetters
export const headerMutations: HeaderMutations
export const pageGetters: PageGetters
export const pageMutations: PageMutations
export const tagsViewGetters: TagsViewGetters
export const tagsViewMutations: TagsViewMutations