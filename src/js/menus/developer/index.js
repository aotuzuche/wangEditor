/*
    menu - code
*/
import $ from '../../util/dom-core.js'
import { getRandom } from '../../util/util.js'
import Panel from '../panel.js'

// 构造函数
function Developer(editor) {
    this.editor = editor
    this.$elem = $(
        `<div class="w-e-menu">开发者</div>`
    )
    this.type = 'panel'
    this.$E = null
}

// 原型
Developer.prototype = {
    constructor: Developer,

    onClick: function (e) {
        const editor = this.editor
        const $startElem = editor.selection.getSelectionStartElem()
        const $endElem = editor.selection.getSelectionEndElem()
        const $eleContainer = editor.selection.getSelectionContainerElem()
        if (!$startElem.equal($endElem)) {
            // 跨元素选择，不做处理
            editor.selection.restoreSelection()
            return
        }
        if (editor._selectedImg) {
            this.$E = editor._selectedImg
        } else {
            this.$E = $eleContainer
        }
        this._initPageScript()
        this._initPageStyle()
        this._createPanel()
    },
    _createPanel: function () {
        const textId = getRandom('texxt')
        const btnId = getRandom('btn')
        const jsId = getRandom('jsid')
        const jsBtn = getRandom('jsBtn')
        const styleId = getRandom('styleId')
        const styleBtn = getRandom('styleBtn')
        const $scriptE = this.editor.$scriptEle
        const defaultScriptStr = $scriptE.html()
        const $styleE = this.editor.$style
        const attributes = [...(this.$E[0].attributes||[])]
          .map(item => ({attrName:item.name,attrValue:item.value}))
        const panel = new Panel(this, {
            width: 500,
            // 一个 Panel 包含多个 tab
            tabs: [
                {
                    // 标题
                    title: '当前元素属性',
                    // 模板
                    tpl: `<div>
                        <textarea id="${textId}" style="height:150px;;">${JSON.stringify(attributes,null,2)}</textarea>
                        <div class="w-e-button-container">
                            <button id="${btnId}" class="right">确定</button>
                        </div>
                    <div>`,
                    // 事件绑定
                    events: [
                        // 插入代码
                        {
                            selector: '#' + btnId,
                            type: 'click',
                            fn: () => {
                                try {
                                    const $text = $('#' + textId)
                                    let jsonStr = $text.val() || $text.html()
                                    const attrs = JSON.parse(jsonStr)
                                    attrs.forEach(attr => {
                                        const {attrName,attrValue} = attr
                                        this.$E.attr(attrName,attrValue)
                                    })
                                    // 返回 true，表示该事件执行完之后，panel 要关闭。否则 panel 不会关闭
                                    return true
                                }catch (e) {
                                    alert(e.message)
                                }
                            }
                        }
                    ]
                }, // first tab end
                {
                    // 标题
                    title: '修改页面脚本',
                    // 模板
                    tpl: `<div>
                        <textarea id="${jsId}" style="height:150px;;">${defaultScriptStr}</textarea>
                        <div class="w-e-button-container">
                            <button id="${jsBtn}" class="right">确定</button>
                        </div>
                    <div>`,
                    // 事件绑定
                    events: [
                        // 插入代码
                        {
                            selector: '#' + jsBtn,
                            type: 'click',
                            fn: () => {
                                const $text = $('#' + jsId)
                                let jsstr = $text.val() || $text.html()
                                $scriptE.html(jsstr)
                                // 返回 true，表示该事件执行完之后，panel 要关闭。否则 panel 不会关闭
                                return true
                            }
                        }
                    ]
                }, // first tab end
                {
                    title: '修改页面样式',
                    tpl: `<div>
                        <textarea id="${styleId}" style="height:150px;;">${$styleE.html()}</textarea>
                        <div class="w-e-button-container">
                            <button id="${styleBtn}" class="right">确定</button>
                        </div>
                    <div>`,
                    events: [
                        {
                            selector: '#' + styleBtn,
                            type: 'click',
                            fn: () => {
                                const $text = $('#' + styleId)
                                let cssStr = $text.val() || $text.html()
                                $styleE.html(cssStr)
                                return true
                            }
                        }
                    ]
                }, // first tab end
            ] // tabs end
        }) // new Panel end

        // 显示 panel
        panel.show()

        // 记录属性
        this.panel = panel
    },

    // 插入代码
    _insertCode: function (value) {
        const editor = this.editor
        editor.cmd.do('insertHTML', `<pre><code>${value}</code></pre><p><br></p>`)
    },

    // 更新代码
    _updateCode: function (value) {
        const editor = this.editor
        const $selectionELem = editor.selection.getSelectionContainerElem()
        if (!$selectionELem) {
            return
        }
        $selectionELem.html(value)
        editor.selection.restoreSelection()
    },

    _initPageScript(){
        let $scriptE = this.editor.$textElem.find('script')
        if($scriptE && $scriptE.length){
            this.editor.$scriptEle = $scriptE.get(0)
        }else{
            $scriptE = $(document.createElement('script'))
            $scriptE.attr('type','text/javascript')
            $scriptE.html(`(function(){\n//输入代码\n}())`)
            this.editor.$scriptEle = $scriptE
            this.editor.$textElem.prepend($scriptE)
        }
    },
    _initPageStyle(){
        let $style = this.editor.$textElem.find('style')
        if($style && $style.length){
            this.editor.$style = $style.get(0)
        }else{
            $style = $(document.createElement('style'))
            $style.attr('type','text/css')
            this.editor.$style = $style
            this.editor.$textElem.prepend($style)
        }
    },
    // 试图改变 active 状态
    tryChangeActive: function (e) {
        const editor = this.editor
        const $elem = this.$elem
        const $selectionELem = editor.selection.getSelectionContainerElem()
        if (!$selectionELem) {
            return
        }
        const $parentElem = $selectionELem.parent()
        if ($selectionELem.getNodeName() === 'CODE' && $parentElem.getNodeName() === 'PRE') {
            this._active = true
            $elem.addClass('w-e-active')
        } else {
            this._active = false
            $elem.removeClass('w-e-active')
        }
    }
}

export default Developer
