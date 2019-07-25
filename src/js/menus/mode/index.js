/*
    menu - code
*/
import $ from '../../util/dom-core.js'
import { getRandom } from '../../util/util.js'

// 构造函数
function Mode(editor) {
    this.editor = editor
    this.tipTextId = getRandom('tipText')
    this.$elem = $(`<div class="w-e-menu"><i id='${this.tipTextId}'>code</i></div>`)
    this.$tipEle = null
    this.type = 'panel'
    // 当前是否 active 状态
    this._active = false
}

// 原型
Mode.prototype = {
    constructor: Mode,

    onClick: function (e) {
        this.$tipEle = $(`#${this.tipTextId}`)
        const editor = this.editor
        const $textElem = editor.$textElem
        if(this.editor.mode === 'view') {
            this.$tipEle.html('预览')
            this.editor.mode = 'code'
            const html = $textElem.html()
            $textElem[0].innerText = html
        }else{
            this.editor.mode = 'view'
            this.$tipEle.html('code')
            const html = $textElem[0].innerText
            $textElem.html(html)
        }

    },
}

export default Mode
