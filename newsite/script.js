benpmSite = (function () {
	function navHover(element) {
		
	}

	const pageTree = {
		Home: {
			Projects,
			Writing
		}
	};
	
	const nav = $("#nav");
	const navLinks = $("#nav a");
	const explore = $("#nav #explore");

	navLinks.on("hover", navHover);
})();
