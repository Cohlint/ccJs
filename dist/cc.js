/*! ccJs - v0.1.0 - 2013-12-03 */+ function() {
	function DateFormat() {};

	DateFormat.prototype.masks = {
		"default": "ddd MMM dd yyyy HH:mm:ss",
		shortDate: "M/d/yy",
		mediumDate: "MMM d, yyyy",
		longDate: "MMMM d, yyyy",
		fullDate: "dddd, MMMM d, yyyy",
		shortTime: "h:mm TT",
		mediumTime: "h:mm:ss TT",
		longTime: "h:mm:ss TT Z",
		isoDate: "yyyy-MM-dd",
		isoTime: "HH:mm:ss",
		isoDateTime: "yyyy-MM-dd'T'HH:mm:ss",
		isoUtcDateTime: "UTC:yyyy-MM-dd'T'HH:mm:ss'Z'"
	};

	DateFormat.prototype.i18n = {
		dayNames: [
			"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
			"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
		],
		monthNames: [
			"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
			"January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
		]
	};

	DateFormat.prototype.pad = function(val, len) {
		val = String(val);
		len = len || 2;
		while (val.length < len) {
			val = "0" + val;
		}
		return val;
	}

	DateFormat.prototype.regs = {
		token: /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
		timezone: /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
		timezoneClip: /[^-+\dA-Z]/g
	}

	DateFormat.prototype.doFormat = function(date, mask, utc) {
		// You can't provide utc if you skip other args (use the "UTC:" mask prefix)
		if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
			mask = date;
			date = undefined;
		}

		// Passing date through Date applies Date.parse, if necessary
		date = date ? new Date(date) : new Date;
		if (isNaN(date)) throw SyntaxError("invalid date");

		mask = String(masks[mask] || mask || masks["default"]);

		// Allow setting the utc argument via the mask
		if (mask.slice(0, 4) == "UTC:") {
			mask = mask.slice(4);
			utc = true;
		}

		var _ = utc ? "getUTC" : "get",
			d = date[_ + "Date"](),
			D = date[_ + "Day"](),
			M = date[_ + "Month"](),
			y = date[_ + "FullYear"](),
			H = date[_ + "Hours"](),
			m = date[_ + "Minutes"](),
			s = date[_ + "Seconds"](),
			L = date[_ + "Milliseconds"](),
			o = utc ? 0 : date.getTimezoneOffset(),
			flags = {
				d: d,
				dd: this.pad(d),
				ddd: i18n.dayNames[D],
				dddd: i18n.dayNames[D + 7],
				M: M + 1,
				MM: this.pad(M + 1),
				MMM: i18n.monthNames[M],
				MMMM: i18n.monthNames[M + 12],
				yy: String(y).slice(2),
				yyyy: y,
				h: H % 12 || 12,
				hh: this.pad(H % 12 || 12),
				H: H,
				HH: this.pad(H),
				m: m,
				mm: this.pad(m),
				s: s,
				ss: this.pad(s),
				l: this.pad(L, 3),
				L: this.pad(L > 99 ? Math.round(L / 10) : L),
				t: H < 12 ? "a" : "p",
				tt: H < 12 ? "am" : "pm",
				T: H < 12 ? "A" : "P",
				TT: H < 12 ? "AM" : "PM",
				Z: utc ? "UTC" : (String(date).match(this.regs.timezone) || [""]).pop().replace(this.regs.timezoneClip, ""),
				o: (o > 0 ? "-" : "+") + this.pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
				S: ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
			};

		return mask.replace(this.regs.token, function($0) {
			return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
		});
	}

	// For convenience...
	var singletonDate = new DateFormat();

	Date.prototype.ccDate = function(mask, utc) {
		return singletonDate.doFormat(this, mask, utc);
	};
}();;+ function($) {
	"use strict";

	// Pagination PUBLIC CLASS DEFINITION
	// ==============================

	var Pagination = function(element, options) {
		this.$element = $(element);
		this.options = $.extend({}, Pagination.DEFAULTS, options);
		$(element).on("click.cc.pagi", this.options.btnPrevClass, this, this.prevPage)
			.on("click.cc.pagi", this.options.btnNextClass, this, this.nextPage)
			.on("click.cc.pagi", this.options.btnFirstClass, this, this.firstPage)
			.on("click.cc.pagi", this.options.btnLastClass, this, this.lastPage)
			.on("change.cc.pagi", this.options.sltChangeSizeClass, this, this.chgsize)
			.on("click.cc.pagi", this.options.btnGotoClass, this, this.gotoPage)
			.on("keydown.cc.pagi", this.options.currPageClass, this, this.gotoPage);
	}

	Pagination.DEFAULTS = {
		totalNumClass: ".cc-total-num", //set to .text()
		totalPageClass: ".cc-total-page", //set to .text()
		currPageClass: ".cc-curr-page", //set to .val() or .text()
		btnPrevClass: ".cc-btn-prev",
		btnNextClass: ".cc-btn-next",
		btnFirstClass: ".cc-btn-first",
		btnLastClass: ".cc-btn-last",
		btnGotoClass: ".cc-btn-goto",
		sltChangeSizeClass: ".cc-slt-chgsize", //set to .val()
		pageNo: 1,
		pageSize: 10,
		totalNum: 0,
		callback: function(offset, size){}
	}

	Pagination.prototype.prevPage = function(e) {
		e.preventDefault();
		e.data.doPagination("prev");
	}

	Pagination.prototype.nextPage = function(e) {
		e.preventDefault();
		e.data.doPagination("next");
	}

	Pagination.prototype.firstPage = function(e) {
		e.preventDefault();
		e.data.doPagination("first");
	}

	Pagination.prototype.lastPage = function(e) {
		e.preventDefault();
		e.data.doPagination("last");
	}

	Pagination.prototype.gotoPage = function(e) {
		if ( (e.keyCode == 13 && e.type == "keydown") || e.type == "click") {
			e.preventDefault();
			e.data.doPagination("goto");
		}
	}

	Pagination.prototype.chgsize = function(e) {
		e.preventDefault();
		e.data.doPagination("changeSize");
	}

	Pagination.prototype.doPagination= function(type) {
		// values for update status 
		var	nextPageNumber = 1;
		var	enabled = true ;

		// related elements
		var $el = this.$element;
		var $totalNum = $el.find(this.options.totalNumClass);
		var $totalPage = $el.find(this.options.totalPageClass);
		var $currPage = $el.find(this.options.currPageClass);
		var $pageSize = $el.find(this.options.sltChangeSizeClass);

		// get values from related elements
		var currentPage = $currPage.is("input") ? $currPage.val() : $currPage.text();
		var pageSize = $pageSize.val();
		var totalNum = this.options.totalNum;

		// verify values
		pageSize = parseInt(pageSize, 10);
		pageSize = (isNaN(pageSize) || pageSize <= 0) ? "10" : pageSize;
		this.updateOptions({pageSize: pageSize});

		currentPage = parseInt(currentPage, 10);
		currentPage = (isNaN(currentPage) || currentPage <= 0) ? "1" : currentPage;

		var totalNum = this.options.totalNum;
		totalNum = parseInt(totalNum, 10);
		totalNum = (isNaN(totalNum) || totalNum <= 0) ? "0" : totalNum;

		var totalPage = Math.ceil(totalNum / pageSize) ;
		totalPage = totalPage <= 0 ? "1" : totalPage;

		//do pagination for each type
		if (type === "first") {
			nextPageNumber = 1;

			if (currentPage <= 1) {
				enabled = false;
			}

		} else if (type === "prev") {
			nextPageNumber = currentPage - 1;
			nextPageNumber = (nextPageNumber <= 0 ? 1 : nextPageNumber);

			if (currentPage <= 1) {
				enabled = false;
			}

		} else if (type === "next") {
			nextPageNumber = currentPage + 1;
			nextPageNumber = (nextPageNumber > totalPage ? totalPage : nextPageNumber);

			if (currentPage >= totalPage) {
				enabled = false;
			}

		} else if (type === "last") {
			nextPageNumber = totalPage;

			if (currentPage >= totalPage) {
				enabled = false;
			}
		} else if (type === "changeSize") {
			nextPageNumber = 1;
		} else if (type === "goto") {
			nextPageNumber = currentPage;
			
			if (currentPage > totalPage || currentPage < 1) {
				enabled = false;
			}
		} else {	//refresh
			nextPageNumber = currentPage;
			enabled = true;
		}

		//pagination result
		if(enabled){
			//disabled button for avoid repeated ajax request
			$el.find(this.options.btnPrevClass).prop("disabled", true);
			$el.find(this.options.btnNextClass).prop("disabled", true);
			$el.find(this.options.btnFirstClass).prop("disabled", true);
			$el.find(this.options.btnLastClass).prop("disabled", true);
			$el.find(this.options.sltChangeSizeClass).prop("disabled", true);
			$el.find(this.options.btnGotoClass).prop("disabled", true);
			$el.find(this.options.currPageClass).prop("disabled", true);

			//update the pageNo for display
			this.updateOptions({pageNo: nextPageNumber});

			//callback function
			this.options.callback((nextPageNumber - 1), pageSize);
		}
	}

	Pagination.prototype.updatePagi = function() {
		var $el = this.$element;
		var totalNum = this.options.totalNum;
		totalNum = parseInt(totalNum, 10);
		totalNum = (isNaN(totalNum) || totalNum <= 0) ? "0" : totalNum;
		var $totalNum = $el.find(this.options.totalNumClass);
		$totalNum.text(totalNum);

		var totalPage = Math.ceil(totalNum / this.options.pageSize);
		totalPage = totalPage <= 0 ? "1" : totalPage;
		var $totalPage = $el.find(this.options.totalPageClass);
		$totalPage.text(totalPage);

		var currPage = this.options.pageNo;
		//reset pageNo = 1
		this.updateOptions({
			pageNo: 1
		});
		if (totalNum = 0) {
			currPage = 1
		}
		var $currPage = $el.find(this.options.currPageClass);
		$currPage.is("input") ? $currPage.val(currPage) : $currPage.text(currPage);

		//enabled button for next
		$el.find(this.options.btnPrevClass).prop("disabled", false);
		$el.find(this.options.btnNextClass).prop("disabled", false);
		$el.find(this.options.btnFirstClass).prop("disabled", false);
		$el.find(this.options.btnLastClass).prop("disabled", false);
		$el.find(this.options.sltChangeSizeClass).prop("disabled", false);
		$el.find(this.options.btnGotoClass).prop("disabled", false);  
		$el.find(this.options.currPageClass).prop("disabled", false);
	}

	Pagination.prototype.updateOptions = function(options) {
		var tempData = this.$element.data("cc.pagi");
		$.extend(tempData.options, options);
		this.$element.data("cc.pagi", tempData);
		return tempData;
	}

	$.fn.ccPagi = function(option) {
		return this.each(function() {
			var $this = $(this);
			var data = $this.data("cc.pagi");
			var options = $.isPlainObject(option) ? option : {};

			if (!data) {
				$this.data("cc.pagi", (data = new Pagination(this, options)));
			} else {
				data =  data.updateOptions(options);
			}
			data.updatePagi();
		})
	}

	$.fn.ccPagi.Constructor = Pagination;

}(jQuery);