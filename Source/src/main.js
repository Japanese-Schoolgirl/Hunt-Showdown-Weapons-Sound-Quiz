// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
// Core variables
const MyMainApi = {}; // Для экспорта
const { BaseDirectory, readDir, readBinaryFile } = window.__TAURI__.fs;
const parseDistance = /^\[\d*m\].(mp3|wav)$/;

// Core functions
MyMainApi["folderScan"] = async (name) =>
{
	let currentDir = BaseDirectory.Resource;
	return await readDir(name, { dir: currentDir, recursive: true });
};

MyMainApi["getCategories"] = async () =>
{
	let Categories = {};

	let folderSounds = await MyMainApi.folderScan("Sounds");
	folderSounds.forEach((category) =>
	{
		let categoryName = category["name"];
		Categories[categoryName] = {};

		category["children"].forEach((weapons) =>
		{
			let weaponName = weapons["name"];
			Categories[categoryName][weaponName] = {};
		
			weapons["children"].forEach((distances) =>
			{
				let distanceName = distances["name"];
				if(!distanceName.match(parseDistance)) { return }
				// Удаление всего кроме значения расстояния: убрав часть до расширения и убрав все не цифры
				distanceName = distanceName.split(".")[0].replace(/\D*/g, "");

				Categories[categoryName][weaponName][distanceName] = distances["path"];
			});
		});
	});

	MyMainApi["CurrentCategories"] = Categories;
	return Categories;
};

MyMainApi["getAudio"] = async (path) =>
{
	return await readBinaryFile(path);
};

window["MyMainApi"] = MyMainApi; // Экспорт
console.log("Core script are loaded.");