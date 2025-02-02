/*
    menu - img
*/
import $ from '../../util/dom-core.js'
import { getRandom } from '../../util/util.js'
import Panel from '../panel.js'

// 构造函数
function Image(editor) {
    this.editor = editor
    const imgMenuId = getRandom('w-e-img')
    this.$elem = $('<div class="w-e-menu" id="' + imgMenuId + '"><i class="w-e-icon-image"></i></div>')
    editor.imgMenuId = imgMenuId
    this.type = 'panel'

    // 当前是否 active 状态
    this._active = false
}

// 原型
Image.prototype = {
    constructor: Image,

    onClick: function () {
        if (this._active) {
            this._createEditPanel()
        } else {
            this._createInsertPanel()
        }
    },

    _createEditPanel: function () {
        const editor = this.editor
        const delBtn = getRandom('del-btn')
        const okBtn = getRandom('ok-btn')
        const styleArea = getRandom('css-area')
        const eventArea = getRandom('click-area')
        const $electedImg = editor._selectedImg
        const cssText = $electedImg[0].style.cssText
        const eventText = $electedImg.attr('onClick') || '(function(){\n//输入代码\n}())'
        // tab 配置
        const tabsConfig = [
            {
                title: '编辑图片',
                tpl: `<div>
                    <div class="w-e-button-container" style="border-bottom:1px solid #f1f1f1;padding-bottom:5px;margin-bottom:5px;">
                        <span style="float:left;font-size:14px;margin:4px 5px 0 5px;color:#333;">样式(cssText)：</span>
                        <textarea id="${styleArea}" rows="4"  style="max-width: 100%" >${cssText}</textarea>
                    </div>
                    <div class="w-e-button-container" style="border-bottom:1px solid #f1f1f1;padding-bottom:5px;margin-bottom:5px;">
                        <span style="float:left;font-size:14px;margin:4px 5px 0 5px;color:#333;">事件：</span>
                        <textarea id="${eventArea}" rows="4" style="max-width: 100%">${eventText}</textarea>
                    </div>
                    <div class="w-e-button-container">
                        <button id="${delBtn}" class="gray left">删除图片</button>
                        <button id="${okBtn}" class="gray right">确认修改</button>
                    </div>
                </div>`,
                events: [
                    {
                        selector: '#' + delBtn,
                        type: 'click',
                        fn: () => {
                            const $img = editor._selectedImg
                            if ($img) {
                                $img.remove()
                            }
                            // 返回 true，表示该事件执行完之后，panel 要关闭。否则 panel 不会关闭
                            return true
                        }
                    },
                    {
                        selector: '#' + okBtn,
                        type: 'click',
                        fn: () => {
                            const $img = editor._selectedImg
                            $img[0].style.cssText = document.getElementById(styleArea).value
                            $img.attr('onClick',document.getElementById(eventArea).value)
                            return true
                        }
                    }
                ]
            }
        ]
        // 创建 panel 并显示
        const panel = new Panel(this, {
            width: 300,
            tabs: tabsConfig
        })
        panel.show()

        // 记录属性
        this.panel = panel
    },

    _createInsertPanel: function () {
        const editor = this.editor
        const uploadImg = editor.uploadImg
        const config = editor.config

        // id
        const upTriggerId = getRandom('up-trigger')
        const upFileId = getRandom('up-file')
        const linkUrlId = getRandom('link-url')
        const linkBtnId = getRandom('link-btn')

        // tabs 的配置
        const tabsConfig = [
            {
                title: '上传图片',
                tpl: `<div class="w-e-up-img-container">
                    <div id="${upTriggerId}" class="w-e-up-btn">
                        <i class="w-e-icon-upload2"></i>
                    </div>
                    <div style="display:none;">
                        <input id="${upFileId}" type="file" multiple="multiple" accept="image/jpg,image/jpeg,image/png,image/gif"/>
                    </div>
                </div>`,
                events: [
                    {
                        // 触发选择图片
                        selector: '#' + upTriggerId,
                        type: 'click',
                        fn: () => {
                            const $file = $('#' + upFileId)
                            const fileElem = $file[0]
                            if (fileElem) {
                                fileElem.click()
                            } else {
                                // 返回 true 可关闭 panel
                                return true
                            }
                        }
                    },
                    {
                        // 选择图片完毕
                        selector: '#' + upFileId,
                        type: 'change',
                        fn: () => {
                            const $file = $('#' + upFileId)
                            const fileElem = $file[0]
                            if (!fileElem) {
                                // 返回 true 可关闭 panel
                                return true
                            }
                            // 获取选中的 file 对象列表
                            const fileList = fileElem.files
                            if (fileList.length) {
                                uploadImg.uploadImg(fileList)
                            }

                            // 返回 true 可关闭 panel
                            return true
                        }
                    }
                ]
            }, // first tab end
            {
                title: '网络图片',
                tpl: `<div>
                    <input id="${linkUrlId}" type="text" class="block" placeholder="图片链接"/></td>
                    <div class="w-e-button-container">
                        <button id="${linkBtnId}" class="right">插入</button>
                    </div>
                </div>`,
                events: [
                    {
                        selector: '#' + linkBtnId,
                        type: 'click',
                        fn: () => {
                            const $linkUrl = $('#' + linkUrlId)
                            const url = $linkUrl.val().trim()

                            if (url) {
                                uploadImg.insertLinkImg(url)
                            }

                            // 返回 true 表示函数执行结束之后关闭 panel
                            return true
                        }
                    }
                ]
            } // second tab end
        ] // tabs end

        // 判断 tabs 的显示
        const tabsConfigResult = []
        if ((config.uploadImgShowBase64 || config.uploadImgServer || config.customUploadImg) && window.FileReader) {
            // 显示“上传图片”
            tabsConfigResult.push(tabsConfig[0])
        }
        if (config.showLinkImg) {
            // 显示“网络图片”
            tabsConfigResult.push(tabsConfig[1])
        }
        // 创建 panel 并显示
        const panel = new Panel(this, {
            width: 300,
            tabs: tabsConfigResult
        })
        panel.show()

        // 记录属性
        this.panel = panel
    },

    // 试图改变 active 状态
    tryChangeActive: function (e) {
        const editor = this.editor
        const $elem = this.$elem
        if (editor._selectedImg) {
            this._active = true
            $elem.addClass('w-e-active')
        } else {
            this._active = false
            $elem.removeClass('w-e-active')
        }
    }
}

export default Image
