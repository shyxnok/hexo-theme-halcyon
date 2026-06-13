    // 运行时间统计
    function recordTime(recordTime,id,str) {
       // 获取当前时间
        var now = new Date();
        // 从全局配置中读取建站或纪念日的起始时间
        var grt = new Date(recordTime); 
         // 每次更新时将当前时间增加250毫秒，使计时更平滑
        now.setTime(now.getTime() + 250);
        // 计算总天数：时间差(毫秒)/1000转秒/60转分/60转时/24转天
        days = (now - grt) / 1000 / 60 / 60 / 24; dnum = Math.floor(days);
        // 计算剩余小时数：总小时数减去已满的天数对应的小时
        hours = (now - grt) / 1000 / 60 / 60 - (24 * dnum); hnum = Math.floor(hours);
        // 如果小时数为个位数，前面补0；然后计算剩余分钟数
        if (String(hnum).length == 1) { hnum = "0" + hnum; } minutes = (now - grt) / 1000 / 60 - (24 * 60 * dnum) - (60 * hnum);
        // 取整分钟数，如果为个位数则补0
        mnum = Math.floor(minutes); if (String(mnum).length == 1) { mnum = "0" + mnum; }
        // 计算剩余秒数：总秒数减去已满的天、小时、分钟对应的秒数
        seconds = (now - grt) / 1000 - (24 * 60 * 60 * dnum) - (60 * 60 * hnum) - (60 * mnum);
        // 取整秒数，如果为个位数则补0
        snum = Math.round(seconds); if (String(snum).length == 1) { snum = "0" + snum; }
        // 将计算结果渲染到页面指定元素中显示
        document.getElementById(id).innerHTML = str + " " + dnum + " 天 " + hnum + " 时 " + mnum + " 分 " + snum + " 秒";
    }
    recordTime(window.config.time,'time','运行时间')
    recordTime(window.config.remembertime,'time2','运行时间2')
    setInterval("recordTime(window.config.time,'time','运行时间')",1000);
    setInterval("recordTime(window.config.remembertime,'time2','运行时间2')",1000); 
