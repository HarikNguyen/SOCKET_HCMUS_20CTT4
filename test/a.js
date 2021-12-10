/*
 Highcharts JS v9.3.2 (2021-11-29)

 Data module

 (c) 2012-2021 Torstein Honsi

 License: www.highcharts.com/license
*/
'use strict';
(function(b) {
    "object" === typeof module && module.exports ? (b["default"] = b,
    module.exports = b) : "function" === typeof define && define.amd ? define("highcharts/modules/data", ["highcharts"], function(p) {
        b(p);
        b.Highcharts = p;
        return b
    }) : b("undefined" !== typeof Highcharts ? Highcharts : void 0)
}
)(function(b) {
    function p(b, h, w, p) {
        b.hasOwnProperty(h) || (b[h] = p.apply(null, w))
    }
    b = b ? b._modules : {};
    p(b, "Core/HttpUtilities.js", [b["Core/Globals.js"], b["Core/Utilities.js"]], function(b, h) {
        var w = b.doc
          , p = h.createElement
          , v = h.discardElement
          , q = h.merge
          , E = h.objectEach
          , x = {
            ajax: function(b) {
                var m = q(!0, {
                    url: !1,
                    type: "get",
                    dataType: "json",
                    success: !1,
                    error: !1,
                    data: !1,
                    headers: {}
                }, b);
                b = {
                    json: "application/json",
                    xml: "application/xml",
                    text: "text/plain",
                    octet: "application/octet-stream"
                };
                var h = new XMLHttpRequest;
                if (!m.url)
                    return !1;
                h.open(m.type.toUpperCase(), m.url, !0);
                m.headers["Content-Type"] || h.setRequestHeader("Content-Type", b[m.dataType] || b.text);
                E(m.headers, function(b, m) {
                    h.setRequestHeader(m, b)
                });
                h.onreadystatechange = function() {
                    if (4 === h.readyState) {
                        if (200 === h.status) {
                            var b = h.responseText;
                            if ("json" === m.dataType)
                                try {
                                    b = JSON.parse(b)
                                } catch (B) {
                                    m.error && m.error(h, B);
                                    return
                                }
                            return m.success && m.success(b)
                        }
                        m.error && m.error(h, h.responseText)
                    }
                }
                ;
                try {
                    m.data = JSON.stringify(m.data)
                } catch (F) {}
                h.send(m.data || !0)
            },
            getJSON: function(b, h) {
                x.ajax({
                    url: b,
                    success: h,
                    dataType: "json",
                    headers: {
                        "Content-Type": "text/plain"
                    }
                })
            },
            post: function(b, h, x) {
                var m = p("form", q({
                    method: "post",
                    action: b,
                    enctype: "multipart/form-data"
                }, x), {
                    display: "none"
                }, w.body);
                E(h, function(b, h) {
                    p("input", {
                        type: "hidden",
                        name: h,
                        value: b
                    }, null, m)
                });
                m.submit();
                v(m)
            }
        };
        "";
        return x
    });
    p(b, "Extensions/Data.js", [b["Core/Chart/Chart.js"], b["Core/Globals.js"], b["Core/HttpUtilities.js"], b["Core/Series/Point.js"], b["Core/Series/SeriesRegistry.js"], b["Core/Utilities.js"]], function(b, h, p, H, I, q) {
        var v = h.doc
          , x = p.ajax
          , w = I.seriesTypes;
        p = q.addEvent;
        var m = q.defined
          , J = q.extend
          , F = q.fireEvent
          , B = q.isNumber
          , C = q.merge
          , K = q.objectEach
          , D = q.pick
          , L = q.splat;
        q = function() {
            function b(a, c, g) {
                this.options = this.rawColumns = this.firstRowAsNames = this.chartOptions = this.chart = void 0;
                this.dateFormats = {
                    "YYYY/mm/dd": {
                        regex: /^([0-9]{4})[\-\/\.]([0-9]{1,2})[\-\/\.]([0-9]{1,2})$/,
                        parser: function(a) {
                            return a ? Date.UTC(+a[1], a[2] - 1, +a[3]) : NaN
                        }
                    },
                    "dd/mm/YYYY": {
                        regex: /^([0-9]{1,2})[\-\/\.]([0-9]{1,2})[\-\/\.]([0-9]{4})$/,
                        parser: function(a) {
                            return a ? Date.UTC(+a[3], a[2] - 1, +a[1]) : NaN
                        },
                        alternative: "mm/dd/YYYY"
                    },
                    "mm/dd/YYYY": {
                        regex: /^([0-9]{1,2})[\-\/\.]([0-9]{1,2})[\-\/\.]([0-9]{4})$/,
                        parser: function(a) {
                            return a ? Date.UTC(+a[3], a[1] - 1, +a[2]) : NaN
                        }
                    },
                    "dd/mm/YY": {
                        regex: /^([0-9]{1,2})[\-\/\.]([0-9]{1,2})[\-\/\.]([0-9]{2})$/,
                        parser: function(a) {
                            if (!a)
                                return NaN;
                            var c = +a[3];
                            c = c > (new Date).getFullYear() - 2E3 ? c + 1900 : c + 2E3;
                            return Date.UTC(c, a[2] - 1, +a[1])
                        },
                        alternative: "mm/dd/YY"
                    },
                    "mm/dd/YY": {
                        regex: /^([0-9]{1,2})[\-\/\.]([0-9]{1,2})[\-\/\.]([0-9]{2})$/,
                        parser: function(a) {
                            return a ? Date.UTC(+a[3] + 2E3, a[1] - 1, +a[2]) : NaN
                        }
                    }
                };
                this.init(a, c, g)
            }
            b.prototype.init = function(a, c, g) {
                var d = a.decimalPoint;
                c && (this.chartOptions = c);
                g && (this.chart = g);
                "." !== d && "," !== d && (d = void 0);
                this.options = a;
                this.columns = a.columns || this.rowsToColumns(a.rows) || [];
                this.firstRowAsNames = D(a.firstRowAsNames, this.firstRowAsNames, !0);
                this.decimalRegex = d && new RegExp("^(-?[0-9]+)" + d + "([0-9]+)$");
                this.rawColumns = [];
                if (this.columns.length) {
                    this.dataFound();
                    var e = !0
                }
                this.hasURLOption(a) && (clearTimeout(this.liveDataTimeout),
                e = !1);
                e || (e = this.fetchLiveData());
                e || (e = !!this.parseCSV().length);
                e || (e = !!this.parseTable().length);
                e || (e = this.parseGoogleSpreadsheet());
                !e && a.afterComplete && a.afterComplete()
            }
            ;
            b.prototype.hasURLOption = function(a) {
                return !(!a || !(a.rowsURL || a.csvURL || a.columnsURL))
            }
            ;
            b.prototype.getColumnDistribution = function() {
                var a = this.chartOptions
                  , c = this.options
                  , g = []
                  , d = function(a) {
                    return (w[a || "line"].prototype.pointArrayMap || [0]).length
                }
                  , e = a && a.chart && a.chart.type
                  , b = []
                  , l = []
                  , n = 0;
                c = c && c.seriesMapping || a && a.series && a.series.map(function() {
                    return {
                        x: 0
                    }
                }) || [];
                var f;
                (a && a.series || []).forEach(function(a) {
                    b.push(d(a.type || e))
                });
                c.forEach(function(a) {
                    g.push(a.x || 0)
                });
                0 === g.length && g.push(0);
                c.forEach(function(c) {
                    var g = new G
                      , k = b[n] || d(e)
                      , h = (a && a.series || [])[n] || {}
                      , u = w[h.type || e || "line"].prototype.pointArrayMap
                      , p = u || ["y"];
                    (m(c.x) || h.isCartesian || !u) && g.addColumnReader(c.x, "x");
                    K(c, function(a, c) {
                        "x" !== c && g.addColumnReader(a, c)
                    });
                    for (f = 0; f < k; f++)
                        g.hasReader(p[f]) || g.addColumnReader(void 0, p[f]);
                    l.push(g);
                    n++
                });
                c = w[e || "line"].prototype.pointArrayMap;
                "undefined" === typeof c && (c = ["y"]);
                this.valueCount = {
                    global: d(e),
                    xColumns: g,
                    individual: b,
                    seriesBuilders: l,
                    globalPointArrayMap: c
                }
            }
            ;
            b.prototype.dataFound = function() {
                this.options.switchRowsAndColumns && (this.columns = this.rowsToColumns(this.columns));
                this.getColumnDistribution();
                this.parseTypes();
                !1 !== this.parsed() && this.complete()
            }
            ;
            b.prototype.parseCSV = function(a) {
                function c(a, c, g, d) {
                    function b(c) {
                        k = a[c];
                        l = a[c - 1];
                        r = a[c + 1]
                    }
                    function e(a) {
                        m.length < y + 1 && m.push([a]);
                        m[y][m[y].length - 1] !== a && m[y].push(a)
                    }
                    function n() {
                        f > t || t > h ? (++t,
                        u = "") : (!isNaN(parseFloat(u)) && isFinite(u) ? (u = parseFloat(u),
                        e("number")) : isNaN(Date.parse(u)) ? e("string") : (u = u.replace(/\//g, "-"),
                        e("date")),
                        p.length < y + 1 && p.push([]),
                        g || (p[y][c] = u),
                        u = "",
                        ++y,
                        ++t)
                    }
                    var z = 0
                      , k = ""
                      , l = ""
                      , r = ""
                      , u = ""
                      , t = 0
                      , y = 0;
                    if (a.trim().length && "#" !== a.trim()[0]) {
                        for (; z < a.length; z++)
                            if (b(z),
                            '"' === k)
                                for (b(++z); z < a.length && ('"' !== k || '"' === l || '"' === r); ) {
                                    if ('"' !== k || '"' === k && '"' !== l)
                                        u += k;
                                    b(++z)
                                }
                            else
                                d && d[k] ? d[k](k, u) && n() : k === q ? n() : u += k;
                        n()
                    }
                }
                function g(a) {
                    var c = 0
                      , g = 0
                      , d = !1;
                    a.some(function(a, d) {
                        var b = !1
                          , e = "";
                        if (13 < d)
                            return !0;
                        for (var k = 0; k < a.length; k++) {
                            d = a[k];
                            var n = a[k + 1];
                            var l = a[k - 1];
                            if ("#" === d)
                                break;
                            if ('"' === d)
                                if (b) {
                                    if ('"' !== l && '"' !== n) {
                                        for (; " " === n && k < a.length; )
                                            n = a[++k];
                                        "undefined" !== typeof t[n] && t[n]++;
                                        b = !1
                                    }
                                } else
                                    b = !0;
                            else
                                "undefined" !== typeof t[d] ? (e = e.trim(),
                                isNaN(Date.parse(e)) ? !isNaN(e) && isFinite(e) || t[d]++ : t[d]++,
                                e = "") : e += d;
                            "," === d && g++;
                            "." === d && c++
                        }
                    });
                    d = t[";"] > t[","] ? ";" : ",";
                    b.decimalPoint || (b.decimalPoint = c > g ? "." : ",",
                    e.decimalRegex = new RegExp("^(-?[0-9]+)" + b.decimalPoint + "([0-9]+)$"));
                    return d
                }
                function d(a, c) {
                    var d = [], g = 0, k = !1, n = [], l = [], f;
                    if (!c || c > a.length)
                        c = a.length;
                    for (; g < c; g++)
                        if ("undefined" !== typeof a[g] && a[g] && a[g].length) {
                            var r = a[g].trim().replace(/\//g, " ").replace(/\-/g, " ").replace(/\./g, " ").split(" ");
                            d = ["", "", ""];
                            for (f = 0; f < r.length; f++)
                                f < d.length && (r[f] = parseInt(r[f], 10),
                                r[f] && (l[f] = !l[f] || l[f] < r[f] ? r[f] : l[f],
                                "undefined" !== typeof n[f] ? n[f] !== r[f] && (n[f] = !1) : n[f] = r[f],
                                31 < r[f] ? d[f] = 100 > r[f] ? "YY" : "YYYY" : 12 < r[f] && 31 >= r[f] ? (d[f] = "dd",
                                k = !0) : d[f].length || (d[f] = "mm")))
                        }
                    if (k) {
                        for (f = 0; f < n.length; f++)
                            !1 !== n[f] ? 12 < l[f] && "YY" !== d[f] && "YYYY" !== d[f] && (d[f] = "YY") : 12 < l[f] && "mm" === d[f] && (d[f] = "dd");
                        3 === d.length && "dd" === d[1] && "dd" === d[2] && (d[2] = "YY");
                        a = d.join("/");
                        return (b.dateFormats || e.dateFormats)[a] ? a : (F("deduceDateFailed"),
                        "YYYY/mm/dd")
                    }
                    return "YYYY/mm/dd"
                }
                var e = this
                  , b = a || this.options
                  , l = b.csv;
                a = "undefined" !== typeof b.startRow && b.startRow ? b.startRow : 0;
                var n = b.endRow || Number.MAX_VALUE
                  , f = "undefined" !== typeof b.startColumn && b.startColumn ? b.startColumn : 0
                  , h = b.endColumn || Number.MAX_VALUE
                  , r = 0
                  , m = []
                  , t = {
                    ",": 0,
                    ";": 0,
                    "\t": 0
                };
                var p = this.columns = [];
                l && b.beforeParse && (l = b.beforeParse.call(this, l));
                if (l) {
                    l = l.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split(b.lineDelimiter || "\n");
                    if (!a || 0 > a)
                        a = 0;
                    if (!n || n >= l.length)
                        n = l.length - 1;
                    if (b.itemDelimiter)
                        var q = b.itemDelimiter;
                    else
                        q = null,
                        q = g(l);
                    var A = 0;
                    for (r = a; r <= n; r++)
                        "#" === l[r][0] ? A++ : c(l[r], r - a - A);
                    b.columnTypes && 0 !== b.columnTypes.length || !m.length || !m[0].length || "date" !== m[0][1] || b.dateFormat || (b.dateFormat = d(p[0]));
                    this.dataFound()
                }
                return p
            }
            ;
            b.prototype.parseTable = function() {
                var a = this.options
                  , c = a.table
                  , g = this.columns || []
                  , d = a.startRow || 0
                  , b = a.endRow || Number.MAX_VALUE
                  , k = a.startColumn || 0
                  , l = a.endColumn || Number.MAX_VALUE;
                c && ("string" === typeof c && (c = v.getElementById(c)),
                [].forEach.call(c.getElementsByTagName("tr"), function(a, c) {
                    c >= d && c <= b && [].forEach.call(a.children, function(a, b) {
                        var e = g[b - k]
                          , f = 1;
                        if (("TD" === a.tagName || "TH" === a.tagName) && b >= k && b <= l)
                            for (g[b - k] || (g[b - k] = []),
                            g[b - k][c - d] = a.innerHTML; c - d >= f && void 0 === e[c - d - f]; )
                                e[c - d - f] = null,
                                f++
                    })
                }),
                this.dataFound());
                return g
            }
            ;
            b.prototype.fetchLiveData = function() {
                function a(e) {
                    function f(f, n, h) {
                        function r() {
                            k && g.liveDataURL === f && (c.liveDataTimeout = setTimeout(a, l))
                        }
                        if (!f || !/^(http|\/|\.\/|\.\.\/)/.test(f))
                            return f && d.error && d.error("Invalid URL"),
                            !1;
                        e && (clearTimeout(c.liveDataTimeout),
                        g.liveDataURL = f);
                        x({
                            url: f,
                            dataType: h || "json",
                            success: function(a) {
                                g && g.series && n(a);
                                r()
                            },
                            error: function(a, c) {
                                3 > ++b && r();
                                return d.error && d.error(c, a)
                            }
                        });
                        return !0
                    }
                    f(n.csvURL, function(a) {
                        g.update({
                            data: {
                                csv: a
                            }
                        })
                    }, "text") || f(n.rowsURL, function(a) {
                        g.update({
                            data: {
                                rows: a
                            }
                        })
                    }) || f(n.columnsURL, function(a) {
                        g.update({
                            data: {
                                columns: a
                            }
                        })
                    })
                }
                var c = this
                  , g = this.chart
                  , d = this.options
                  , b = 0
                  , k = d.enablePolling
                  , l = 1E3 * (d.dataRefreshRate || 2)
                  , n = C(d);
                if (!this.hasURLOption(d))
                    return !1;
                1E3 > l && (l = 1E3);
                delete d.csvURL;
                delete d.rowsURL;
                delete d.columnsURL;
                a(!0);
                return this.hasURLOption(d)
            }
            ;
            b.prototype.parseGoogleSpreadsheet = function() {
                function a(c) {
                    var b = ["https://sheets.googleapis.com/v4/spreadsheets", d, "values", l(), "?alt=json&majorDimension=COLUMNS&valueRenderOption=UNFORMATTED_VALUE&dateTimeRenderOption=FORMATTED_STRING&key=" + g.googleAPIKey].join("/");
                    x({
                        url: b,
                        dataType: "json",
                        success: function(d) {
                            c(d);
                            g.enablePolling && setTimeout(function() {
                                a(c)
                            }, k)
                        },
                        error: function(a, c) {
                            return g.error && g.error(c, a)
                        }
                    })
                }
                var c = this
                  , g = this.options
                  , d = g.googleSpreadsheetKey
                  , b = this.chart
                  , k = Math.max(1E3 * (g.dataRefreshRate || 2), 4E3)
                  , l = function() {
                    if (g.googleSpreadsheetRange)
                        return g.googleSpreadsheetRange;
                    var a = ("ABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(g.startColumn || 0) || "A") + ((g.startRow || 0) + 1)
                      , c = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(D(g.endColumn, -1)) || "ZZ";
                    m(g.endRow) && (c += g.endRow + 1);
                    return a + ":" + c
                };
                d && (delete g.googleSpreadsheetKey,
                a(function(a) {
                    a = a.values;
                    if (!a || 0 === a.length)
                        return !1;
                    var d = a.reduce(function(a, c) {
                        return Math.max(a, c.length)
                    }, 0);
                    a.forEach(function(a) {
                        for (var c = 0; c < d; c++)
                            "undefined" === typeof a[c] && (a[c] = null)
                    });
                    b && b.series ? b.update({
                        data: {
                            columns: a
                        }
                    }) : (c.columns = a,
                    c.dataFound())
                }));
                return !1
            }
            ;
            b.prototype.trim = function(a, c) {
                "string" === typeof a && (a = a.replace(/^\s+|\s+$/g, ""),
                c && /^[0-9\s]+$/.test(a) && (a = a.replace(/\s/g, "")),
                this.decimalRegex && (a = a.replace(this.decimalRegex, "$1.$2")));
                return a
            }
            ;
            b.prototype.parseTypes = function() {
                for (var a = this.columns, c = a.length; c--; )
                    this.parseColumn(a[c], c)
            }
            ;
            b.prototype.parseColumn = function(a, c) {
                var b = this.rawColumns, d = this.columns, e = a.length, k = this.firstRowAsNames, l = -1 !== this.valueCount.xColumns.indexOf(c), n, f = [], h = this.chartOptions, m, p = (this.options.columnTypes || [])[c];
                h = l && (h && h.xAxis && "category" === L(h.xAxis)[0].type || "string" === p);
                for (b[c] || (b[c] = []); e--; ) {
                    var t = f[e] || a[e];
                    var q = this.trim(t);
                    var A = this.trim(t, !0);
                    var v = parseFloat(A);
                    "undefined" === typeof b[c][e] && (b[c][e] = q);
                    h || 0 === e && k ? a[e] = "" + q : +A === v ? (a[e] = v,
                    31536E6 < v && "float" !== p ? a.isDatetime = !0 : a.isNumeric = !0,
                    "undefined" !== typeof a[e + 1] && (m = v > a[e + 1])) : (q && q.length && (n = this.parseDate(t)),
                    l && B(n) && "float" !== p ? (f[e] = t,
                    a[e] = n,
                    a.isDatetime = !0,
                    "undefined" !== typeof a[e + 1] && (t = n > a[e + 1],
                    t !== m && "undefined" !== typeof m && (this.alternativeFormat ? (this.dateFormat = this.alternativeFormat,
                    e = a.length,
                    this.alternativeFormat = this.dateFormats[this.dateFormat].alternative) : a.unsorted = !0),
                    m = t)) : (a[e] = "" === q ? null : q,
                    0 !== e && (a.isDatetime || a.isNumeric) && (a.mixed = !0)))
                }
                l && a.mixed && (d[c] = b[c]);
                if (l && m && this.options.sort)
                    for (c = 0; c < d.length; c++)
                        d[c].reverse(),
                        k && d[c].unshift(d[c].pop())
            }
            ;
            b.prototype.parseDate = function(a) {
                var c = this.options.parseDate, b, d = this.options.dateFormat || this.dateFormat, e;
                if (c)
                    var k = c(a);
                else if ("string" === typeof a) {
                    if (d)
                        (c = this.dateFormats[d]) || (c = this.dateFormats["YYYY/mm/dd"]),
                        (e = a.match(c.regex)) && (k = c.parser(e));
                    else
                        for (b in this.dateFormats)
                            if (c = this.dateFormats[b],
                            e = a.match(c.regex)) {
                                this.dateFormat = b;
                                this.alternativeFormat = c.alternative;
                                k = c.parser(e);
                                break
                            }
                    e || (a.match(/:.+(GMT|UTC|[Z+-])/) && (a = a.replace(/\s*(?:GMT|UTC)?([+-])(\d\d)(\d\d)$/, "$1$2:$3").replace(/(?:\s+|GMT|UTC)([+-])/, "$1").replace(/(\d)\s*(?:GMT|UTC|Z)$/, "$1+00:00")),
                    e = Date.parse(a),
                    "object" === typeof e && null !== e && e.getTime ? k = e.getTime() - 6E4 * e.getTimezoneOffset() : B(e) && (k = e - 6E4 * (new Date(e)).getTimezoneOffset()))
                }
                return k
            }
            ;
            b.prototype.rowsToColumns = function(a) {
                var c, b;
                if (a) {
                    var d = [];
                    var e = a.length;
                    for (c = 0; c < e; c++) {
                        var k = a[c].length;
                        for (b = 0; b < k; b++)
                            d[b] || (d[b] = []),
                            d[b][c] = a[c][b]
                    }
                }
                return d
            }
            ;
            b.prototype.getData = function() {
                if (this.columns)
                    return this.rowsToColumns(this.columns).slice(1)
            }
            ;
            b.prototype.parsed = function() {
                if (this.options.parsed)
                    return this.options.parsed.call(this, this.columns)
            }
            ;
            b.prototype.getFreeIndexes = function(a, c) {
                var b, d = [], e = [];
                for (b = 0; b < a; b += 1)
                    d.push(!0);
                for (a = 0; a < c.length; a += 1) {
                    var k = c[a].getReferencedColumnIndexes();
                    for (b = 0; b < k.length; b += 1)
                        d[k[b]] = !1
                }
                for (b = 0; b < d.length; b += 1)
                    d[b] && e.push(b);
                return e
            }
            ;
            b.prototype.complete = function() {
                var a = this.columns, c, b = this.options, d, e, k = [];
                if (b.complete || b.afterComplete) {
                    if (this.firstRowAsNames)
                        for (d = 0; d < a.length; d++) {
                            var l = a[d];
                            m(l.name) || (l.name = D(l.shift(), "").toString())
                        }
                    l = [];
                    var h = this.getFreeIndexes(a.length, this.valueCount.seriesBuilders);
                    for (d = 0; d < this.valueCount.seriesBuilders.length; d++) {
                        var f = this.valueCount.seriesBuilders[d];
                        f.populateColumns(h) && k.push(f)
                    }
                    for (; 0 < h.length; ) {
                        f = new G;
                        f.addColumnReader(0, "x");
                        d = h.indexOf(0);
                        -1 !== d && h.splice(d, 1);
                        for (d = 0; d < this.valueCount.global; d++)
                            f.addColumnReader(void 0, this.valueCount.globalPointArrayMap[d]);
                        f.populateColumns(h) && k.push(f)
                    }
                    0 < k.length && 0 < k[0].readers.length && (f = a[k[0].readers[0].columnIndex],
                    "undefined" !== typeof f && (f.isDatetime ? c = "datetime" : f.isNumeric || (c = "category")));
                    if ("category" === c)
                        for (d = 0; d < k.length; d++)
                            for (f = k[d],
                            h = 0; h < f.readers.length; h++)
                                "x" === f.readers[h].configName && (f.readers[h].configName = "name");
                    for (d = 0; d < k.length; d++) {
                        f = k[d];
                        h = [];
                        for (e = 0; e < a[0].length; e++)
                            h[e] = f.read(a, e);
                        l[d] = {
                            data: h
                        };
                        f.name && (l[d].name = f.name);
                        "category" === c && (l[d].turboThreshold = 0)
                    }
                    a = {
                        series: l
                    };
                    c && (a.xAxis = {
                        type: c
                    },
                    "category" === c && (a.xAxis.uniqueNames = !1));
                    b.complete && b.complete(a);
                    b.afterComplete && b.afterComplete(a)
                }
            }
            ;
            b.prototype.update = function(a, c) {
                var b = this.chart;
                a && (a.afterComplete = function(a) {
                    a && (a.xAxis && b.xAxis[0] && a.xAxis.type === b.xAxis[0].options.type && delete a.xAxis,
                    b.update(a, c, !0))
                }
                ,
                C(!0, b.options.data, a),
                this.init(b.options.data))
            }
            ;
            return b
        }();
        h.data = function(b, a, c) {
            return new h.Data(b,a,c)
        }
        ;
        p(b, "init", function(b) {
            var a = this
              , c = b.args[0] || {}
              , g = b.args[1];
            c && c.data && !a.hasDataDef && (a.hasDataDef = !0,
            a.data = new h.Data(J(c.data, {
                afterComplete: function(b) {
                    var d;
                    if (Object.hasOwnProperty.call(c, "series"))
                        if ("object" === typeof c.series)
                            for (d = Math.max(c.series.length, b && b.series ? b.series.length : 0); d--; ) {
                                var k = c.series[d] || {};
                                c.series[d] = C(k, b && b.series ? b.series[d] : {})
                            }
                        else
                            delete c.series;
                    c = C(b, c);
                    a.init(c, g)
                }
            }),c,a),
            b.preventDefault())
        });
        var G = function() {
            function b() {
                this.readers = [];
                this.pointIsArray = !0;
                this.name = void 0
            }
            b.prototype.populateColumns = function(a) {
                var b = !0;
                this.readers.forEach(function(b) {
                    "undefined" === typeof b.columnIndex && (b.columnIndex = a.shift())
                });
                this.readers.forEach(function(a) {
                    "undefined" === typeof a.columnIndex && (b = !1)
                });
                return b
            }
            ;
            b.prototype.read = function(a, b) {
                var c = this.pointIsArray
                  , d = c ? [] : {};
                this.readers.forEach(function(e) {
                    var g = a[e.columnIndex][b];
                    c ? d.push(g) : 0 < e.configName.indexOf(".") ? H.prototype.setNestedProperty(d, g, e.configName) : d[e.configName] = g
                });
                if ("undefined" === typeof this.name && 2 <= this.readers.length) {
                    var e = this.getReferencedColumnIndexes();
                    2 <= e.length && (e.shift(),
                    e.sort(function(a, b) {
                        return a - b
                    }),
                    this.name = a[e.shift()].name)
                }
                return d
            }
            ;
            b.prototype.addColumnReader = function(a, b) {
                this.readers.push({
                    columnIndex: a,
                    configName: b
                });
                "x" !== b && "y" !== b && "undefined" !== typeof b && (this.pointIsArray = !1)
            }
            ;
            b.prototype.getReferencedColumnIndexes = function() {
                var a, b = [];
                for (a = 0; a < this.readers.length; a += 1) {
                    var g = this.readers[a];
                    "undefined" !== typeof g.columnIndex && b.push(g.columnIndex)
                }
                return b
            }
            ;
            b.prototype.hasReader = function(a) {
                var b;
                for (b = 0; b < this.readers.length; b += 1) {
                    var g = this.readers[b];
                    if (g.configName === a)
                        return !0
                }
            }
            ;
            return b
        }();
        h.Data = q;
        return h.Data
    });
    p(b, "masters/modules/data.src.js", [b["Core/Globals.js"], b["Core/HttpUtilities.js"], b["Extensions/Data.js"]], function(b, h, p) {
        b.ajax = h.ajax;
        b.getJSON = h.getJSON;
        b.post = h.post;
        b.Data = p;
        b.HttpUtilities = h
    })
});
//# sourceMappingURL=data.js.map
