console.log("Авторка этой костыльной машины-смерти: Japanese Schoolgirl (Lisa)");
console.log("~Сделано для newmoonSHIRA~");

// Функция, требующая main.js и прогружающая аудио
async function updateAudio(file, when)
{
	let audioBlob = new Blob([await MyMainApi.getAudio(file)], { type: "audio/mp3" });
	let audioLink = URL.createObjectURL(audioBlob);

	document.querySelector(when).setAttribute("src", audioLink);
	return audioLink;
};

// Рандомное число от min до max
function RandomBetween(min, max) // from min to max
{
	if(+min < +max)
	{
		return Math.floor(Math.random()*(+max - +min + 1) + +min);
	}
	else
	{
		return Math.floor(Math.random()*(+min - +max + 1) + +max);
	}
};

function SearchWithStyle(searchText)
{ /* Добавляет фильтр, который устанавливает display none для всех слов, которые соответствуют ему. */
	if(!searchText) {return "" };
	return `#MainWindow #WeaponSelect #WeaponsVariant .checkbox:not([name*="${searchText.toLowerCase()}"]) { display: none !important; }`;
};

function uncheckAllExcept(exceptID)
{
	document.querySelectorAll("#WeaponsVariant input").forEach((checkbox) =>
	{
		if(checkbox == exceptID.target) { return };
		checkbox.checked = false;
	});
};

function createCheckboxes(from, when)
{
	let catergories_checkbox = "";
	let this_array = from["forEach"] ? from : Object.keys(from);
	this_array.forEach((category)=>
	{
		catergories_checkbox += `<div class="checkbox" name="${category.toLowerCase()}"><input type="checkbox" id="${category}"><label for="${category}">${category}</label></div>`;
	})
	document.getElementById(when).innerHTML = catergories_checkbox;
};

function startQuiz()
{
	// Получает в переменную список выбранных категорий
	let whichSelected = {}; // Зачем массив, когда есть прекрасный объект?
	let howManySelected = 0; // Напоминание: 0 также равнозначен false
	window["CategoriesPool"] = [];
	document.querySelectorAll("#CategoriesSelect input").forEach((checkbox) =>
	{
		if(!checkbox.checked) { return };

		howManySelected++;
		whichSelected[howManySelected] = checkbox.id;

		// Общий пул со всеми оружиями из выбранных категорий
		Object.keys(window["Categories"][checkbox.id]).forEach((el) =>
		{
			window["CategoriesPool"].push(el);
			// Для полного экспорта: window["CategoriesPool"].push(window["Categories"][checkbox.id][el]);
		});
	});
	// Прерывает функцию, если ничего выбрано
	if(!howManySelected) { return };

	// Переменная, определяющая количество раундов
	let howManyRounds = document.querySelector("#DifficultySelect select").value;
	// Глобальная переменная, запоминающая грядущие раунды
	window["Rounds"] = {};
	// Глобальная для настроек Quiz-а
	window["QuizOptions"] = {};
	window["QuizOptions"]["HideDistance"] = document.querySelector("#Option_HideDistance").checked;

	// Рандомизация раундов
	for(var i = 1; i <= howManyRounds; i++)
	{
		let randomCategory = whichSelected[RandomBetween(1, howManySelected)];

		let howManyWeapons = Object.keys(window["Categories"][randomCategory]).length;
		let randomWeapon = Object.entries(window["Categories"][randomCategory])[RandomBetween(1, howManyWeapons)-1];

		let howManyDistances = Object.keys(randomWeapon[1]).length;
		let randomDistance = Object.entries(randomWeapon[1])[RandomBetween(1, howManyDistances)-1];

		window["Rounds"][i] = { Category:randomCategory, Weapon: randomWeapon[0], Distance: randomDistance[0], File: randomDistance[1] };
		console.log(`В раунде [${i}] будет Категория: [${randomCategory}] Оружие: [${randomWeapon[0]}] Дистанция: [${randomDistance[0]}] (Файл: [${randomDistance[1]}])`);
	}

	// Сохраняет состояние меню
	window["SavedMainMenu"] = document.getElementById("MainWindow").innerHTML;
	loadQuizMenu();
};

function loadAboutMenu()
{
	// Сохраняет состояние меню
	window["SavedMainMenu"] = document.getElementById("MainWindow").innerHTML;
	document.getElementById('MainWindow').innerHTML = window['SavedAboutMenu'];
};

function loadResultMenu()
{
	console.log("End");
	// Загружает вместо предыдущего меню Результатовое-меню
	let MainWindow = document.getElementById("MainWindow");
	MainWindow.innerHTML = window["SavedResultMenu"];

	let ResultScreen = document.getElementById("ResultScreen");
	let howManyResults = Object.keys(roundResults).length;
	let howManyCorrect = 0;
	let user_result = "";
	let total_result = "";
	Object.keys(roundResults).forEach((i) => 
	{
		if(roundResults[i]["isCorrect"]) { howManyCorrect++; }; // Считает количество правильных ответов
		let isCorrect = roundResults[i]["isCorrect"];
		let isCorrectClass = isCorrect ? "CorrectAnswer" : "WrongAnswer";
		let weaponWas = roundResults[i]["weaponWas"];
		let distanceWas = roundResults[i]["distanceWas"];

		let weaponSelected = roundResults[i]["weaponSelected"];
		let distanceSelected = roundResults[i]["distanceSelected"] ? ` с ${roundResults[i]["distanceSelected"]} метров` : "";
		let answer = "ответ: ";
		answer += distanceSelected ? weaponSelected+distanceSelected : weaponSelected;

		if(!weaponSelected) { answer = "ответ и не был дан"; }
		user_result += `<div class=${isCorrectClass}>Раунд ${i} ${isCorrect ? "верный" : "неверный"}! `;
		if(isCorrect) { user_result += `Это был выстрел из ${weaponWas} с ${distanceWas} метров!</div>`; }
		else { user_result += `Это был выстрел из ${weaponWas} с ${distanceWas} метров, а твой ${answer}!</div>`; };
	});
	total_result = `<div class="TotalCount">Правильно ${howManyCorrect} из ${howManyResults} (${(howManyCorrect/howManyResults)*100}%)</div>`;
	ResultScreen.innerHTML = total_result+user_result;
};

function loadQuizMenu()
{
	// Загружает вместо предыдущего меню Quiz-меню
	let MainWindow = document.getElementById("MainWindow");
	MainWindow.innerHTML = window["SavedQuizMenu"];
	// Очищает предыдущие результаты
	window["roundResults"] = {};
	// Создает первый раунд
	console.log("Start");
	generateRound(1);
};

function generateRound(number, needVerify = false)
{
	if(!Rounds[number]) { return loadResultMenu(); };

	let weapon = window["Rounds"][number]["Weapon"];
	let distance = window["Rounds"][number]["Distance"];
	let file = window["Rounds"][number]["File"];
	let category = window["Rounds"][number]["Category"];
	let need_distance = window["QuizOptions"]["HideDistance"];

	if(needVerify)
	{
		roundResults[number] = {};
		roundResults[number]["isCorrect"] = false;
		roundResults[number]["weaponWas"] = weapon;
		roundResults[number]["distanceWas"] = distance;
		document.querySelectorAll(`#WeaponsVariant input`).forEach((checkbox) =>
		{
			if(!checkbox.checked) { return }
			
			let weaponSelected = checkbox.id;
			let distanceSelected = document.getElementById("DistanceVariant").value;

			roundResults[number]["weaponSelected"] = weaponSelected;
			roundResults[number]["distanceSelected"] = distanceSelected;
			// Не засчитывает ответ, если дистанция указана не верно
			if(need_distance) { if(distance != distanceSelected) { return } }

			roundResults[number]["isCorrect"] = weaponSelected === weapon;
		});
		return generateRound(number+1);
	};

	let lastResult = roundResults[number-1];
	if(lastResult !== undefined)
	{
		let lastResultDiv = document.getElementById("LastResult");
		lastResultDiv.setAttribute("style", "");
		if(lastResult["isCorrect"])
		{
			lastResultDiv.textContent = `Раунд ${number-1} пройдет`;
			lastResultDiv.setAttribute("class", "CorrectAnswer");
		}
		else
		{
			lastResultDiv.textContent = `Раунд ${number-1} не пройден. Это был ${roundResults[number-1]["weaponWas"]} с ${roundResults[number-1]["distanceWas"]} метров!`;
			lastResultDiv.setAttribute("class", "WrongAnswer");
		}
	}

	document.getElementById("RoundLabel").setAttribute("number", number);
	document.getElementById("RoundLabel").textContent = `Раунд ${number}`;
	if(need_distance) { document.getElementById("DistanceVariant").setAttribute("style", ""); }
	else { document.querySelector("#WeaponSelect .Question text").textContent = ` (Выстрел сделан с ${distance} метров)`; };

	updateAudio(file, '#WeaponSound');
	createCheckboxes(CategoriesPool, "WeaponsVariant");
	document.getElementById("WeaponsVariant").addEventListener('change', uncheckAllExcept);

	console.log(`Раунд ${number}. Текущее оружие: ${weapon} из категории ${category} (выстрел с дистанции ${distance})`);
};

function createMainMenu()
{
	// Грузит сохранённое состояние меню, если такое есть
	if(window["SavedMainMenu"]) { document.getElementById("MainWindow").innerHTML = SavedMainMenu; }
	// Создает лист с категориями
	createCheckboxes(Categories, "CategoriesSelect");
};

window.addEventListener("DOMContentLoaded", async () =>
{
	window["Categories"] = await MyMainApi.getCategories();
	console.log("Folders are scanned.");

	createMainMenu()
});