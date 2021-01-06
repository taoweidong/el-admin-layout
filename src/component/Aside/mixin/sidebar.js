import {Const, asideGetters} from "el-admin-layout"
import hamburgerMixin from 'el-admin-layout/src/mixin/hamburger'
import menuMixin from "el-admin-layout/src/mixin/menu"
import menuSearchMixin from './menuSearch'
import NavMenu from 'el-admin-layout/src/component/NavMenu'
import {getSidebarMenus} from "el-admin-layout/src/helper"

export default {
    inheritAttrs: false,

    mixins: [hamburgerMixin, menuMixin, menuSearchMixin],

    components: {NavMenu},

    computed: {
        //侧边栏菜单
        menus: () => getSidebarMenus()
    },

    watch: {
        '$route.path': {
            immediate: true,
            handler(v) {
                //如果是redirect跳转，则跳过
                if (v.startsWith(Const.redirectPath)) return

                this.activeMenu = this.getActiveMenuByRoute(this.$route)

                const menu = this.$_getElMenuInstance()
                if (!menu) return
                const item = menu.items[this.activeMenu]

                //如果侧边栏中没有对应的激活菜单，则收起全部，退出
                if (!item) return menu.openedMenus = []

                //由于elMenu的initOpenedMenu()不会触发select事件，所以选择手动触发
                this.onSelect(item.index, item.indexPath, item, false)

                //滚动至激活的菜单
                this.$nextTick(this.moveToActiveMenuVertically)
            }
        }
    },

    methods: {
        //模拟选中菜单
        onSelect(index, indexPath, item, jump = true) {
            //开启手风琴模式时，激活没有子级的菜单时收起其它展开项
            if (asideGetters.uniqueOpen && indexPath.length === 1) {
                const menu = this.$_getElMenuInstance()
                const opened = menu.openedMenus
                opened.forEach(i => i !== index && menu.closeMenu(i))
            }

            jump && this.actionOnSelectMenu(index)

            //为了兼容OnePart
            this.afterSelect && this.afterSelect()
        }
    }
}
