var science = (function () {
	var dark = "#202020";
	var light = "#d0d0d0";
	var top = $(".top");
	var projects = $(".projects .proj");
	var projectList = $(".projects");
	var out = $("#out");
	var tip = $("#tooltip");
	var filterer = $("#filterer");
	var filters = [];
	var exitButton = $(out.children()[0]);
	var empty = out.html();
	var current;
	var data;

	function projectClick(element) {
		console.log(element);
		document.body.style.backgroundColor = light;
		out.show();
		out.html(out.html() + $(element).html());
		projectList.hide();
		top.hide();
		current = element;
		$("#filters").hide();
	}

	function projectExit(event) {
		document.body.style.backgroundColor = dark;
		out.html(empty);
		out.hide();
		projectList.show();
		top.show();
		current = null;
		$("#filters").show();
	}

	function handleKeys(event) {
		console.debug(event.originalEvent.code);
		if (event.originalEvent.code == "Escape" && current) {
			projectExit();
		}
	}

	function interactText(type) {
		switch (type) {
			case "Game": return "Play Game"
			case "Music": return "Listen"
			case "Craft": return "Learn More"
			case "Web": return "Web Link"
			case "Photo": return "View Album"
			case "Video": return "Watch Video"
			case "Writing": return "Read Here"
			case "Art": return "View Here"
			case "Misc": return "Experience"
		}
	}

	function tooltip(element) {
		tip.css("background-color", $(element).attr("color"));
		tip.addClass("hovered");
		tip.text($(element).attr("alt"));
	}

	function untooltip(element) {
		tip.text("");
		tip.removeClass("hovered");
	}

	function filter(element) {
		element = $(element);
		var wasOn = element.hasClass("off");
		$("#filters img").removeClass("off");
		filters.length = 0;
		if (!wasOn) {
			element.addClass("off");
			filters.push(element.attr("alt"));
		}

		if (filters.length == 0) {
			filterer.html("");
			return;
		}

		var filtercss = ".proj {display: none;}\n";
		for (var i = 0; i < filters.length; i++) {
			filtercss += `.proj[type=${filters[i]}]${i < filter.length - 1 ? ", " : " "}`;
		}
		filtercss += "{display: initial;}";
		filterer.html(filtercss);
		console.log(filtercss);
	}

	function foundData(raw) {
		data = Papa.parse(raw).data.slice(1);
		console.log(data);
		for (row of data) {
			var newProject = $("<div>", {
				class: "proj",
				type: row[2],
				//style: `background-image: url(${row[4]});`,
				//onclick: "science.projectClick(this);"
			});
			newProject.append($("<div>", { class: "info" }).append(
				$("<div>", {
					style: `background-image: url(${row[4]});`,
					class: "pic"
				}),
				$("<h2>", {
					class: "title"
				}).text(row[1]).append($("<span>")/* .text(` | ${row[2]} | ${row[0]}`) */),
				$("<hr>", {}),
				$("<p>", {
					class: "desc"
				}).text(row[3]),
				$("<a>", {
					href: row[5],
					target: "_blank"
				}).append($("<button>").text(interactText(row[2])))
			));
			projectList.append(newProject);
		}
	}

	return {
		begin: function () {
			projects.on("click", projectClick);
			$(document.body).keypress(handleKeys);
			out.hide();
			$.get("https://docs.google.com/spreadsheets/d/e/2PACX-1vSdiDE0OcKN4EsRuO-5xfVfaAwpOJ7EpEFN_XRPrApEcmEXO6p9O5Y1XM8ptHKatiTUCEawkZ4bWdUZ/pub?gid=0&single=true&output=csv", "", foundData);
		},
		projectExit, projectClick, tooltip, untooltip, filter
	};
})();

science.begin();
