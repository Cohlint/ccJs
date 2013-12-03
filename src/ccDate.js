/* ========================================================================
 * ccDate.js
 * This jquery plugin is use for date format, reference [Steven Levithan "http://blog.stevenlevithan.com/archives/date-time-format"]
 * Copyright 2013 Cohlint
 * Released under the MIT license
 * https://github.com/Cohlint/ccJs
 * v0.1.0
 * ======================================================================== */

+ function() {
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
}();