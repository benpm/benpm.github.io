function navOn(event) {
	let element = $(event.currentTarget);
	$nest.show();
	$("#nav #nest a").hide();
	$("#nav .cat").data("selected", "false").css("text-decoration", "");
	$("." + element.text()).show();
	element.css("text-decoration", "underline");
}

function navOff(event) {
	let element = $(event.currentTarget);
	$nest.hide();
	$("." + element.text()).hide();
	element.css("text-decoration", "");
}

function navToggle(event) {
	let element = $(event.currentTarget);
	let state = element.data("selected");
	if (state == "false") {
		navOn(event);
		element.data("selected", "true");
	} else {
		navOff(event);
		element.data("selected", "false");
	}
	
}

const pageTree = {
	projects: [
		"easypin",
		"new_soils",
		"paperlike"
	],
	journal: [
		"11_4_2018"
	],
	art: [
		"gallery"
	],
	archive: [
		"old_stuff"
	]
};

const nav = $("#nav");
const navLinks = $("#nav a");
const root = window.location.origin;

//Construct pagetree
const $nest = $("<span>", { id: "nest" });
nav.append($nest);
for (const category in pageTree) {
	const $category = $("<span>", {
		class: "item cat",
		text: category
	});
	$category.data("selected", "false");
	nav.prepend($category);
	for (const page of pageTree[category]) {
		$nest.append($("<a>", {
			style: "display: none;",
			class: "item nested " + category,
			text: page,
			href: `${root}/${category}/${page}.html`
		}));
	}
	$category.on("click", navToggle);
}
nav.prepend($("<a>", {
	style: "font-weight: bold; background: #505050;",
	class: "item",
	text: "benpm.github.io",
	href: root
}));
$nest.hide();
