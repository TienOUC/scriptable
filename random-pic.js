//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
//1. 根据 label 从 Unsplash (https://images.unsplash.com) 随机获取一张图片
//2. Unsplash API 👉 https://source.unsplash.com/
//3. 本脚本需要access_token，在2中网址注册开发者获取
//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

//请求页面的图片数,脚本从中随机显示一张
const perPageItems = 20;
//脚本执行
const widget = await createWidget();
Script.setWidget(widget);

//创建组件
async function createWidget() {
	const widget = new ListWidget();
	const imgData = await getImgUrl();

	//小飞机图标
	const iconStack = widget.addStack();
	const iconSymbol = SFSymbol.named('paperplane.fill');
	const headerIcon = iconStack.addImage(iconSymbol.image);
	headerIcon.imageSize = new Size(18, 18);
	headerIcon.tintColor = Color.white();
	//Safari跳转到原尺寸图片链接地址,以便浏览细节或者执行保存等操作
	headerIcon.url = `${imgData[1].raw}`;
	iconStack.useDefaultPadding();

	const bgImg = await getRandomPic(imgData);
	widget.backgroundImage = bgImg;

	widget.addSpacer();
	const author = imgData[0].name;
	console.log(author);
	const titleText = widget.addText(author);
	titleText.font = Font.boldRoundedSystemFont(20);
	titleText.textColor = Color.white();
	titleText.leftAlignText();

	const time = new Date(imgData[0].updated_at).toLocaleString('en', {
		month: 'short',
		day: 'numeric',
		weekday: 'long',
	});
	console.log(time);
	const timeText = widget.addText(time);
	timeText.font = Font.boldRoundedSystemFont(14);
	timeText.textColor = Color.white();
	timeText.leftAlignText();

	//刷新widget（间隔5分钟）,官方服务有请求次数限制（50次/h）,根据个人喜好修改最后一位数字（改成几就是间隔几分钟刷新）
	const interval = 1000 * 60 * 5;
	widget.refreshAfterDate = new Date(Date.now() + interval);

	return widget;
}

async function getImgUrl() {
	//返回值,存储author,imgUrl
	const res = [];
	//认证 access_token
	const accessToken = 'Access Key'; //👈 这个token换成你自己的（去 https://source.unsplash.com/ 注册）,因为官方服务有请求次数限制（50次/h）
	//图片标签 label
	const label = await randomLabel();
	const selectedItem = await randomNumber();
	const endpoint = 'https://api.unsplash.com/search/photos/';

	let queryString = '';
	const params = {
		client_id: accessToken,
		query: label,
		page: 1,
		per_page: perPageItems,
		//竖屏portrait, 横屏landscape, 方形squarish, 不指定时显示全部
		//orientation: 'portrait',
		order_by: 'relevant',
	};

	for (const [key, value] of Object.entries(params)) {
		queryString += `${key}=${value}&`;
	}

	const imgObjectUrl = `${endpoint}?${queryString.slice(0, -1)}`;

	try {
		const imgObjectRequest = new Request(imgObjectUrl);
		const imgObjectData = await imgObjectRequest.loadJSON();
		//user对象
		const author = await imgObjectData.results[selectedItem].user;
		res.push(author);
		//图片URL
		const imgUrl = await imgObjectData.results[selectedItem].urls;
		res.push(imgUrl);

		return res;
	} catch (err) {
		console.log(err);
		return null;
	}
}

//根据 label 从 Unsplash (https://images.unsplash.com) 随机获取一张图片
async function getRandomPic(imgData) {
	try {
		const imgUrl = imgData[1].regular;
		console.log(imgUrl);
		const imgRequest = new Request(imgUrl);
		const img = await imgRequest.loadImage();
		return img;
	} catch (err) {
		console.log(err);
		return null;
	}
}

//随机选取页面中的一项
async function randomNumber() {
	const selectedItem = Math.floor(Math.random() * perPageItems);
	return selectedItem;
}
//随机获取图片tag（将想要显示的图片tag加入数组label）
async function randomLabel() {
	const label = ['wallpaper', 'blonde', 'forest', 'river', 'tree', 'mountains', 'winter', 'fire', 'sunflower'];
	const len = label.length;
	return label[Math.floor(Math.random() * len)];
}
