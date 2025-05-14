// ==UserScript==
// @name        S3 Helper
// @namespace   Violentmonkey Scripts
// @grant       none
// @version     1.0
// @author      -
// @include      *sbis.ru/*
// @include      *saby.ru/*
// @include      *sabyget.ru/*
// @include      *sabytrade.ru/*
// @include      *reg.tensor.ru/*
// @include      *region.tensor.ru*
// @include      *corp.tensor.ru*
// @downloadURL     https://raw.githubusercontent.com/golovinov/userscripts/refs/heads/main/s3.js
// @grant        unsafeWindow
// @grant        GM_info
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_notification
// @grant        GM_openInTab
// ==/UserScript==

(function(win){
    console.log('⌛ S3: initialization in process');

    let addedModules = new Set();
    const fixedModules = {
        BaseChats: ['Channel', 'ChannelChat',  'Intent', 'Message', 'QuickReply'],
        Consultant: ['Consultant', 'WidgetEmbedScriptRouting'],
        Chatbot: ['Chatbot', 'Chatbot-client','Route'],
        Platform: ['Page']
    };

    function getCookie(name) {
        let matches = document.cookie.match(new RegExp(
            "(?:^|; )" + name.replace(/([.$?*|{}()\[\]\\/+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    }

    function setCookie(name, value, options = {}) {
        options = { path: '/', ...options };
        if (options.expires instanceof Date) options.expires = options.expires.toUTCString();
        let updatedCookie = encodeURIComponent(name) + "=" + value;
        for (let optionKey in options) {
            updatedCookie += "; " + optionKey;
            let optionValue = options[optionKey];
            if (optionValue !== true) updatedCookie += "=" + optionValue;
        }
        document.cookie = updatedCookie;
    }

    const hr = () => { document.cookie = 's3HotReload=3000;path=/'; }

    const s3 = (moduleInput, options) => {
        if (!moduleInput) return;

        const current = getCookie('s3debug') || '';
        const modules = current ? current.split(',') : [];

        const newModules = moduleInput.split(',').map(m => m.trim()).filter(m => m);

        for (const mod of newModules) {
            if (!modules.includes(mod)) {
                modules.push(mod);
                addedModules.add(mod);
            }
        }

        setCookie('s3debug', [...new Set(modules)].join(','), { secure: true, samesite: 'None', domain: '.sbis.ru', ...options });
        showDebug();
    }

    const s3d = (moduleInput, options) => {
        if (!moduleInput) return;

        const current = getCookie('s3debug') || '';
        let modules = current ? current.split(',') : [];

        const removeModules = moduleInput.split(',').map(m => m.trim()).filter(m => m);

        modules = modules.filter(mod => !removeModules.includes(mod));

        setCookie('s3debug', modules.join(','), { secure: true, samesite: 'None', domain: '.sbis.ru', ...options });
        showDebug();
    }

    function showDebug() {
        const debList = (getCookie('s3debug') || '').split(',');

        if (debList.length === 0) return;

        const b = document.body;
        let div = document.querySelector('#debugModules');

        if (!div) {
            div = document.createElement('div');
            div.id = 'debugModules';
            div.style = 'background: white; padding: 2px 3px; position: absolute; top: 0; right: 0; z-index: 1000; opacity: 0.8; border-radius: 0 0 0 5px; font-size: 12px; cursor: pointer;';
            div.addEventListener('click', toggleModuleList);
            b.appendChild(div);
        }

        div.innerHTML = debList
            .map(mod => `<span style='${addedModules.has(mod) ? "color:red;" : ""}'>${mod.slice(0, 2)}</span>`)
            .join(', ') + ' <span style="cursor: pointer;">🖊️</span>';

        div.title = debList.join('\n');

        let moduleList = document.querySelector('#moduleList');

        if (!moduleList) {
            moduleList = document.createElement('div');
            moduleList.id = 'moduleList';
            moduleList.style = 'display:none; padding: 5px; background: white; position: fixed; top: 20px; right: 0; border: 1px solid #ccc; font-size: 12px; z-index: 1000; opacity: 0.8; border-radius: 5px; box-shadow: 1px 1px 0 rgba(0,0,0,.198);';

            const displayedModules = new Set(Object.values(fixedModules).flat());

            Object.entries(fixedModules).forEach(([group, modules]) => {
                const groupTitle = document.createElement('div');
                groupTitle.style = 'font-weight: bold; margin-top: 5px; margin-bottom: 3px;';
                groupTitle.textContent = group;
                moduleList.appendChild(groupTitle);

                modules.forEach(module => {
                    createCheckbox(moduleList, module, debList);
                    displayedModules.add(module);
                });
            });

            const tempModules = debList.filter(mod => !displayedModules.has(mod));

            if (tempModules.length) {
                const tempTitle = document.createElement('div');
                tempTitle.style = 'font-weight: bold; margin-top: 5px; margin-bottom: 3px;';
                tempTitle.textContent = 'Временные';
                moduleList.appendChild(tempTitle);

                tempModules.forEach(module => createCheckbox(moduleList, module, debList));
            }

            b.appendChild(moduleList);
        }
    }

    function createCheckbox(container, module, debList) {
        const label = document.createElement('label');
        label.style = 'margin-left: 3px;';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = debList.includes(module);
        checkbox.addEventListener('change', () => {
            checkbox.checked ? s3(module) : s3d(module);
        });
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(' ' + module));
        container.appendChild(label);
        container.appendChild(document.createElement('br'));
    }

    function toggleModuleList() {
        const list = document.querySelector('#moduleList');
        list.style.display = list.style.display === 'none' ? 'block' : 'none';
    }

    win.hr = hr;
    win.s3 = s3;
    win.showDebug = showDebug;

    showDebug();

})(unsafeWindow);
