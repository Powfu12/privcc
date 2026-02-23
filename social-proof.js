(function () {
    'use strict';

    // ==================== STYLES ====================
    var css = '\
#spContainer{position:fixed;bottom:24px;left:24px;z-index:99999;display:flex;flex-direction:column-reverse;gap:10px;pointer-events:none;max-width:300px}\
.sp-notif{display:flex;align-items:center;gap:12px;background:rgba(14,14,16,.96);border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:12px 14px;box-shadow:0 10px 40px rgba(0,0,0,.5),0 2px 10px rgba(0,0,0,.3);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);pointer-events:all;transform:translateX(calc(-100% - 30px));opacity:0;transition:transform .42s cubic-bezier(.34,1.4,.64,1),opacity .35s ease;will-change:transform,opacity}\
.sp-notif--in{transform:translateX(0);opacity:1}\
.sp-notif--out{transform:translateX(calc(-100% - 30px));opacity:0;transition:transform .38s ease-in,opacity .3s ease-in}\
.sp-avatar{width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#d4af37,#f0d060);display:flex;align-items:center;justify-content:center;font-size:1rem;font-weight:800;color:#000;flex-shrink:0}\
.sp-body{flex:1;min-width:0}\
.sp-top{display:flex;align-items:center;gap:5px;margin-bottom:2px}\
.sp-name{font-size:.85rem;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\
.sp-flag{font-size:.9rem;flex-shrink:0}\
.sp-pkg{font-size:.78rem;color:rgba(255,255,255,.65);margin-bottom:2px}\
.sp-pkg strong{color:#d4af37;font-weight:700}\
.sp-meta{font-size:.71rem;color:rgba(255,255,255,.35);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\
.sp-close{background:none;border:none;color:rgba(255,255,255,.3);font-size:1.15rem;cursor:pointer;padding:0;line-height:1;flex-shrink:0;align-self:flex-start;transition:color .2s}\
.sp-close:hover{color:rgba(255,255,255,.75)}\
@media(max-width:500px){#spContainer{bottom:16px;left:12px;right:12px;max-width:calc(100vw - 24px)}}';

    var styleEl = document.createElement('style');
    styleEl.textContent = css;
    document.head.appendChild(styleEl);

    // ==================== DATA ====================
    var NAMES = [
        'James','Oliver','Emma','Sophia','Liam','Noah','Ava','Isabella',
        'Ethan','Lucas','Mia','Charlotte','Mason','Logan','Amelia','Harper',
        'Jack','Aiden','Ella','Avery','Elijah','Caden','Scarlett','Grace',
        'Sebastian','Carter','Victoria','Luna','Mateo','Owen','Aria','Chloe',
        'Jayden','Wyatt','Penelope','Layla','Grayson','Julian','Riley','Zoey',
        'Levi','Isaac','Nora','Lily','Gabriel','Lincoln','Eleanor','Hannah',
        'Ryan','David','Sarah','Julia','Daniel','Alex','Sophie','Nathan',
        'Tyler','Brandon','Zoe','Claire','Dylan','Connor','Megan','Paige',
        'Caleb','Hunter','Brooke','Savannah','Evan','Sean','Natalie','Leah',
        'Marcus','Leon','Nina','Anya','Max','Felix','Laura','Kristina',
        'Tom','Chris','Anna','Sandra','Patrick','Adrian','Diana','Monica',
        'Kevin','Ben','Amy','Rachel','Steve','Mike','Lisa','Katie'
    ];

    var COUNTRIES = [
        {name:'United States',flag:'🇺🇸'},
        {name:'United Kingdom',flag:'🇬🇧'},
        {name:'Germany',flag:'🇩🇪'},
        {name:'France',flag:'🇫🇷'},
        {name:'Canada',flag:'🇨🇦'},
        {name:'Australia',flag:'🇦🇺'},
        {name:'Netherlands',flag:'🇳🇱'},
        {name:'Sweden',flag:'🇸🇪'},
        {name:'Norway',flag:'🇳🇴'},
        {name:'Switzerland',flag:'🇨🇭'},
        {name:'Belgium',flag:'🇧🇪'},
        {name:'Denmark',flag:'🇩🇰'},
        {name:'Spain',flag:'🇪🇸'},
        {name:'Italy',flag:'🇮🇹'},
        {name:'Poland',flag:'🇵🇱'},
        {name:'Portugal',flag:'🇵🇹'},
        {name:'Austria',flag:'🇦🇹'},
        {name:'Finland',flag:'🇫🇮'},
        {name:'Ireland',flag:'🇮🇪'},
        {name:'New Zealand',flag:'🇳🇿'},
        {name:'Japan',flag:'🇯🇵'},
        {name:'Singapore',flag:'🇸🇬'},
        {name:'UAE',flag:'🇦🇪'},
        {name:'Luxembourg',flag:'🇱🇺'},
        {name:'Czech Republic',flag:'🇨🇿'},
        {name:'Slovakia',flag:'🇸🇰'},
        {name:'Romania',flag:'🇷🇴'},
        {name:'Hungary',flag:'🇭🇺'},
        {name:'Greece',flag:'🇬🇷'},
        {name:'Croatia',flag:'🇭🇷'}
    ];

    var PACKAGES = [
        'Basic Package',
        'Standard Package',
        'Professional Package',
        'Basic Package',
        'Standard Package',
        'Basic Package'
    ];

    var TIMES = [
        'just now','just now','just now',
        '1 min ago','2 mins ago','3 mins ago',
        '4 mins ago','5 mins ago','7 mins ago',
        '8 mins ago','10 mins ago','12 mins ago',
        '15 mins ago','18 mins ago','20 mins ago'
    ];

    // ==================== LOGIC ====================
    function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

    function init() {
        var container = document.getElementById('spContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'spContainer';
            document.body.appendChild(container);
        }

        function showSP() {
            var name    = rand(NAMES);
            var country = rand(COUNTRIES);
            var pkg     = rand(PACKAGES);
            var time    = rand(TIMES);

            var el = document.createElement('div');
            el.className = 'sp-notif';
            el.innerHTML =
                '<div class="sp-avatar">' + name.charAt(0) + '</div>' +
                '<div class="sp-body">' +
                    '<div class="sp-top">' +
                        '<span class="sp-name">' + name + '</span>' +
                        '<span class="sp-flag">' + country.flag + '</span>' +
                    '</div>' +
                    '<div class="sp-pkg">ordered <strong>' + pkg + '</strong></div>' +
                    '<div class="sp-meta">' + country.name + ' &middot; ' + time + '</div>' +
                '</div>' +
                '<button type="button" class="sp-close" aria-label="Close">&times;</button>';

            container.appendChild(el);

            requestAnimationFrame(function () {
                requestAnimationFrame(function () { el.classList.add('sp-notif--in'); });
            });

            function dismiss() {
                el.classList.remove('sp-notif--in');
                el.classList.add('sp-notif--out');
                setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 450);
            }

            el.querySelector('.sp-close').addEventListener('click', dismiss);
            setTimeout(dismiss, 5500);
        }

        // First notification after 2.5 s, then every 4–9 s
        setTimeout(function loop() {
            showSP();
            setTimeout(loop, 4000 + Math.random() * 5000);
        }, 2500);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
