// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange icon-glyph: quote-right

const User = 'Tien'
const City = 'beijing'
// 城市经纬度
const Coordinates = '116.41,39.92'
const WeatherKey = '在后面的注释网站里申请key' // you can get it from https://dev.heweather.com/// 
const AQIKey ='在后面的注释网站里申请key'   // https://dev.heweather.com/
 
// const AQIToken = '44502fc36d70867d1ba3f20cd11447a550f950d3' // you can get it from https://aqicn.org/data-platform/token/#/

const aqi = await getAQI()
const lunarData = await getLunarData()
const weatherData = await getWeather()
console.log(weatherData)
const widget = createWidget()
Script.setWidget(widget)
Script.complete()

function createWidget() {
    const w = new ListWidget()
    const bgColor = new LinearGradient()

    bgColor.colors = [new Color('#2c5364'), new Color('#203a43'), new Color('#0f2027')]
    bgColor.locations = [0.0, 0.5, 1.0]
    w.backgroundGradient = bgColor

    w.setPadding(12, 12, 12, 0)
    w.spacing = 8

    const time = new Date()

    const hour = time.getHours()
    const isMidnight = hour < 8 && 'midnight'
    const isMorning = hour >= 8 && hour < 12 && 'morning'
    const isAfternoon = hour >= 12 && hour < 19 && 'afternoon'
    const isEvening = hour >= 19 && hour < 21 && 'evening'
    const isNight = hour >= 21 && 'night'

    const dfTime = new DateFormatter()
    dfTime.locale = 'en'
    dfTime.useMediumDateStyle()
    dfTime.useNoTimeStyle()

    const Line1 = w.addText(`[🤖] Hi, ${User}. Good ${isMidnight || isMorning || isAfternoon || isEvening || isNight}!`)
    Line1.textColor = new Color('#fb6b55') 
//     Line1.font = new Font('Menlo', 11)  
    Line1.font = Font.boldRoundedSystemFont(12)
    const enTime = dfTime.string(time)
    const Line2 = w.addText(`[📆] ${enTime} ${lunarData}`)
    Line2.textColor = new Color('#C6FFDD')
//     Line2.font = new Font('Menlo', 11)  
   Line2.font = Font.boldRoundedSystemFont(12)
    const Line3 = w.addText(`[☁️] ${weatherData} AQI:${aqi}`)
    Line3.textColor = new Color('#3896d0')
//     Line3.font = new Font('Menlo', 11)
   Line3.font = Font.boldRoundedSystemFont(12)

    const Line4 = w.addText(`[${Device.isCharging() ? '⚡️' : '🔋'}] ${renderBattery()} ${Device.isCharging() ? 'Charging' : 'Battery'}`)
    Line4.textColor = new Color('#2aa876')
//     Line4.font = new Font('Menlo', 11)
   Line4.font = Font.boldRoundedSystemFont(12)
    const Line5 = w.addText(`[⏳] ${renderYearProgress()} YearProgress`)
    Line5.textColor = new Color('#fba566')
//     Line5.font = new Font('Menlo', 11)
    Line5.font = Font.boldRoundedSystemFont(12)
    return w
}
// 访问速度慢，需要梯子
//  async function getAQI() {
//      const url = `https://api.waqi.info/feed/${City}/?token=${AQIToken}`
//      const request = new Request(url)
//      const res = await request.loadJSON()
//      return res.data.aqi
// }

async function getAQI() {
   const url = `https://devapi.qweather.com/v7/air/now?location=${Coordinates}&key=${AQIKey}`// 
     const request = new Request(url, timeoutInterval = 1800)
     const res = await request.loadJSON()
    //console.log(res.now)
     return res.now.aqi 
 }

async function getLunarData() {
    const url = 'https://api.xlongwei.com/service/datetime/convert.json'
    const request = new Request(url, timeoutInterval = 3600)
    const res = await request.loadJSON()
    return `${res.ganzhi}年（${res.shengxiao}）${res.chinese.replace(/.*年/, '')}`
}

async function getWeather() {
    const requestCityInfo = new Request(
        `https://geoapi.heweather.net/v2/city/lookup?key=${WeatherKey}&location=${City}&lang=en`, timeoutInterval = 1800
    )
    const resCityInfo = await requestCityInfo.loadJSON()
    const { name, id } = resCityInfo.location[0]
    //console.log(name)

    const requestNow = new Request(`https://devapi.heweather.net/v7/weather/now?location=${id}&key=${WeatherKey}&lang=en`, timeoutInterval = 3600)    
    const requestDaily = new Request(`https://devapi.heweather.net/v7/weather/3d?location=${id}&key=${WeatherKey}&lang=en`, timeoutInterval = 3600)   
    const resNow = await requestNow.loadJSON()
    const resDaily = await requestDaily.loadJSON()
console.log(resDaily.daily[0])

    //return `${name} ${resNow.now.text} T:${resNow.now.temp}° H:${resDaily.daily[0].tempMax}° L:${resDaily.daily[0].tempMin}°`
    return `${name} | ${resNow.now.text} Temp:${resNow.now.temp}° UV:${resDaily.daily[0].uvIndex}`
}

function renderProgress(progress) {
    const used = '▓'.repeat(Math.floor(progress * 15))
    const left = '░'.repeat(15 - used.length)
    return `${used}${left} ${Math.floor(progress * 100)}%`
}

function renderBattery() {
    const batteryLevel = Device.batteryLevel()
    return renderProgress(batteryLevel)
}

function renderYearProgress() {
    const now = new Date()
    const start = new Date(now.getFullYear(), 0, 1) // Start of this year
    const end = new Date(now.getFullYear() + 1, 0, 1) // End of this year
    const progress = (now - start) / (end - start)
    return renderProgress(progress)
}