module.exports = function(grunt) {
    // 配置
    grunt.initConfig({
        pkg : grunt.file.readJSON("package.json"),
        dirs: {
			jsSrc: ["src/ccDate.js",
				"src/ccPagi.js"
			],

            dest: "dist/<%= pkg.name %>/<%= pkg.version %>"
        },
		concat: {
			js: {
				options: {
					separator: ";",
					stripBanners: true,
					banner: "/*! <%= pkg.name %> - v<%= pkg.version %> - " + "<%= grunt.template.today('yyyy-mm-dd') %> */",
				},
				src: "<%= dirs.jsSrc %>",
				dest: "dist/cc.js",
				nonull: true
			}
		},
        uglify : {
            options : {
               // banner : "/*! <%= pkg.name %> <%= grunt.template.today('yyyy-mm-dd') %> */\n" ,
               // report : "gzip"
            },
            myDist : {
                options: {
                  //   sourceMap: "dest/source-map.js"
                },
				files: {
					"dist/cc.min.js": ["dist/cc.js"]
				}
            }
        },
		// cssmin: {
		// 	options: {
		// 		//report: "gzip",
		// 		keepSpecialComments: 0,
		// 		banner: "/* This file is concated and compressed by <%= dirs.cssSrc %> */",
		// 	},
		// 	minify: {
		// 		expand: true,
		// 		cwd: "../../server/web/cohlint/css/",
		// 		src: ["cohlint2.5-v<%= pkg.version %>.css"],
		// 		dest: "../../server/web/cohlint/css/",
		// 		//ext: ".min.css",
		// 		rename: function(dest, src) {
		// 			var filename = src.substring(0, src.lastIndexOf("."));
		// 			return dest  + filename + ".min.css";
		// 		}
		// 	}
		// }

    });
    // 载入concat和uglify插件，分别对于合并和压缩
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    //grunt.loadNpmTasks("grunt-contrib-cssmin");
    
    // regist task
    grunt.registerTask("default", ["concat", "uglify"]);  /*"cssmin",*/ 
}; 