//创建小组件
const widget = new ListWidget();

//添加文本
const news = await getNewsContent();
//console.log(news[0]);

let textContent = '';
for (let i = 0; i < 6; i++) {
	//timeString格式 HH:mm
	let timeString = news[i].create_time.match(/\d{2}:\d{2}/)[0];
	textContent += `${i + 1}. ${news[i].rich_text.replace(/\s+/g, '')} (${timeString})\n\n`;
}

//标题图标
let headerStack = widget.addStack();
let iconSymbol = SFSymbol.named('newspaper.fill');
let headerIcon = headerStack.addImage(iconSymbol.image);
headerIcon.imageSize = new Size(16, 16);
headerIcon.tintColor = Color.dynamic(Color.green(), new Color('#1badf8'));

//标题文字
let time = new Date();
let timeText = time.toLocaleString('zh-CN', { month: 'long', day: 'numeric' });
let headerText = headerStack.addText(` 全球财经新闻  ${timeText}`);
headerText.textColor = Color.dynamic(Color.green(), new Color('#1badf8'));
headerText.font = Font.mediumRoundedSystemFont(14);

headerStack.useDefaultPadding();
//标题与正文间距
widget.addSpacer(12);

//正文
const text = widget.addText(textContent);

//字体样式
text.textColor = Color.dynamic(new Color('#000000'), new Color('#fbfcfb'));
text.font = Font.mediumRoundedSystemFont(12.5);
text.textOpacity = 0.7;
text.leftAlignText();

//显示的最大行数，超出的部分显示为...
text.lineLimit = 25;

//边距
//widget.setPadding(16, 16, 16, 16);
widget.useDefaultPadding();

//动态背景色
widget.backgroundColor = Color.dynamic(new Color('#ffffff'), new Color('#1b1c1e'));

//>>>渐变色背景
//const gradient = new LinearGradient();
//gradient.locations = [0, 0.5, 1];
//gradient.colors = [
//new Color('#2c5364'),
//new Color('#203a43'),
//new Color('#0f2027'),
//];
//widget.backgroundGradient = gradient;
//<<<<

//跳转到 Safari 浏览器打开网页
//Safari.open('https://news.dodolo.top');
//在 app 内全屏打开网页
Safari.openInApp('https://news.dodolo.top', true);
//设置组件
Script.setWidget(widget);

//获取news json
async function getNewsContent() {
	const url = 'https://zhibo.sina.com.cn/api/zhibo/feed?page=1&page_size=30&zhibo_id=152&tag_id=0&dire=f&dpc=1&type=0';
	const request = new Request(url, (timeoutInterval = 120));
	const res = await request.loadJSON();
	const listArr = res.result.data.feed.list;
	const filterArr = ['比特币', '莱特币', '瑞波币', '以太币', '以太坊', '狗狗币', '疫苗', '新冠', '疫情', '蓬佩奥'];

	let filterResult = listArr.filter((item) => {
		return filterArr.every((ele) => {
			return !item.rich_text.includes(ele);
		});
	});

	return filterResult;
}
