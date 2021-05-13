    //要同步的时间段，当前时间前后n个月
    var dur_month = 1

    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - dur_month)
    console.log(`日历的开始时间 ${startDate.toLocaleDateString()}`)

    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + dur_month)
    console.log(`日历的结束时间 ${endDate.toLocaleDateString()}`)

    const reminders = await Reminder.allDueBetween(startDate, endDate)
    console.log(`获取 ${reminders.length} 条提醒事项`)

    var calendar = await Calendar.forEvents()

    //获取日历名和对应的日历
    var m_dict = {}
    for(cal of calendar)
    {
    m_dict[cal.title] = cal
    //console.log(`日历:${cal.title}`)
    }

    const events = await CalendarEvent.between(startDate, endDate, calendar)
    console.log(`获取 ${events.length} 条日历`)
    // console.log(events)

    for (const reminder of reminders) {
    reminder.notes = (!reminder.notes || reminder.notes == null || reminder.notes == 'undefined') ? '无' : reminder.notes
    //reminder的标识符
    //const targetNote = `[Reminder] ${reminder.identifier}`
    //这里用identifier来过滤重复事件最严谨，但日历备注里不好看，所以为了显示好看一些，做了不是很严谨的修改
    const targetNote = `同步自提醒事项👇\n列表：${reminder.calendar.title}\n标题：${reminder.title}\n时间：${reminder.creationDate.toLocaleString('zh-CN', {year: 'numeric', month: '2-digit', day: '2-digit'}).replace(/\//g, '.')}`       
    const [targetEvent] = events.filter(e => e.notes != null && (e.notes.indexOf(targetNote) != -1))  //过滤重复的reminder
    
    if(!m_dict[reminder.calendar.title])
    {
        console.warn("找不到日历" + reminder.calendar.title)
        continue
    }
    
    if (targetEvent) {
        //console.log(`找到已经创建的事项 ${reminder.title}`)
        updateEvent(targetEvent, reminder)
    } else {
        console.warn(`同步提醒事项【${reminder.title}】到日历【${reminder.calendar.title}】`)
        const newEvent = new CalendarEvent()
        newEvent.notes = reminder.notes + '\n\n' + targetNote   //要加入备注
        updateEvent(newEvent, reminder)

    }
    }

    Script.complete()

    //设置period
    function setPeriod(event, period, option) {
    const optionItem = (option == '延期' || option == '提前') ? '完成' : ''
    if(period < 3600) {
        return subHeading = (Math.floor((period / 60).toFixed(1)) == 0) ? `准时完成` : `${option}${(period / 60).toFixed()}分钟${optionItem}`
    }else if(period >= 3600 && period <= 3600 * 24) {
        return subHeading = (((period % 3600) / 60).toFixed() == 0) ? `${option}${(period / 3600).toFixed()}小时${optionItem}` : `${option}${Math.floor((period / 3600).toFixed(2))}小时${((period % 3600) / 60).toFixed()}分钟${optionItem}`
    }else{
        return subHeading = (((period % (3600 * 24)) / 3600).toFixed()) == 0 ? `${option}${(period / 3600 / 24).toFixed()}天${optionItem}` : `${option}${(period / 3600 / 24).toFixed()}天${((period % (3600 * 24)) / 3600).toFixed()}小时${optionItem}`
    }
    }

    //日历中创建提醒
    function updateEvent(event, reminder) {
    cal_name = reminder.calendar.title
    cal = m_dict[cal_name]
    event.calendar = cal
    //console.warn(event.calendar.title)
    //已完成事项
    if(reminder.isCompleted) {
        event.isAllDay = false
        event.startDate = reminder.dueDate
        event.endDate = reminder.completionDate
        var period = (reminder.dueDate - reminder.completionDate) / 1000
        period = period.toFixed()
        if(period < 0) {
        period = -period
        let titleTail = setPeriod(event, period, '延期')
        event.title = `✅${reminder.title} (${titleTail})`
        }
        else if (period == 0){
        event.title = `✅${reminder.title} (准时完成)`
        }
        else
        {
        let titleTail = setPeriod(event, period, '提前')
        event.title = `✅${reminder.title} (${titleTail})`
        event.endDate = reminder.dueDate
        event.startDate = reminder.completionDate
        }
    }
    //未完成事项
    else{
        const nowtime  = new Date()
        var period = (reminder.dueDate - nowtime) / 1000
        period = period.toFixed()
        if(period < 0) {
            //待办顺延
            period = -period
            let titleTail = setPeriod(event, period, '已延期')
            //如果不是在同一天,设置为全天事项
            if(reminder.dueDate.getDate() != nowtime.getDate()){
            event.title = `❌${reminder.title} (${titleTail})` 
            event.startDate = nowtime
            event.endDate = nowtime
            event.isAllDay = true    
            }
            //在同一天的保持原来的时间
            else{
            // let titleTail = setPeriod(event, period, '已延期')
            event.title = `⭕️${reminder.title} (${titleTail})`
            event.isAllDay = false  
            event.startDate = reminder.dueDate
            event.endDate = nowtime
            }
        }else{
            event.isAllDay = false
            let titleTail = setPeriod(event, period, '还剩')
            event.title = `⭕️${reminder.title} (${titleTail})`
            event.startDate = reminder.dueDate
            // var ending = new Date(reminder.dueDate)
            // ending.setHours(ending.getHours() + 1)
            event.endDate = reminder.dueDate
        }
        }
    event.save()
    }