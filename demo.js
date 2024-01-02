        // 编译函数
        function compile(node, vm) {
            let reg = /\{\{(.*)\}\}/ // 匹配模板{{ }}
            // 判断节点类型
            // 元素节点
            if (node.nodeType === 1) {
                let attr = node.attributes;
                // 遍历属性
                Array.from(attr).forEach(function (attr) {
                    // 判断属性名字
                    if (attr.nodeName === 'v-model') {
                        // 获取v-model绑定的值
                        let name = attr.nodeValue;
                        // 给当前元素节点绑定一个值
                        node.value = vm.data[name];
                        // 监听当前元素节点
                        node.addEventListener('input', function () {
                            // 给data中对应的属性赋值
                            vm.data[name] = this.value;
                         
                            
                        })
                 
                    }
                })
            }
            // 文本节点
            if (node.nodeType === 3) {
                if (reg.test(node.nodeValue)) {
                    let name = RegExp.$1;
                    name = name.trim();
                    // 给当前文本节点绑定一个值
                    node.nodeValue = vm.data[name];
                    // 监听当前文本节点
                    new Watcher(vm, node, name)
                }
            }
        }
        // 向碎片化文档添加节点
        function nodeToFragment(node, vm) {
            let flag = document.createDocumentFragment();
            let firstChild;
            while (firstChild = node.firstChild) {
                compile(firstChild, vm);
                flag.appendChild(firstChild);
            }
            return flag;
        }
        // 构造函数
        function Vue(options) {
            this.data = options.data;
            observe(this.data, this);
            let id = options.el;
            let dom = nodeToFragment(document.getElementById(id), this);
            // 编译完成后，将dom返回到app中
            document.getElementById(id).appendChild(dom);
        }

        function observe(data, vm) {
            Object.keys(data).forEach(function (key) {
              defineReactive(vm.data, key, data[key]);
            });
          }
          
          function defineReactive(data, key, val) {
            let dep = new Dep();
            Object.defineProperty(data, key, {
              get: function () {
                console.log('get', val);
                if (Dep.target) {
                  dep.addSub(Dep.target);
                }
                return val;
              },
              set: function (newVal) {
                console.log('set', newVal);
                if (newVal === val) return;
                val = newVal;
                dep.notify();
              },
            });
          }



        function Watcher(vm, node, name) {
            Dep.target = this;
            this.name = name;
            this.node = node;
            this.vm = vm;
            this.update()
            Dep.target = null;
        }
        Watcher.prototype = {
            update() {
                // this.get();
                this.node.nodeValue = this.vm.data[this.name];
                // this.node.nodeValue = this.value //更改节点内容的关键
            },
            // get() {
            //     this.value = this.vm[this.name] //触发相应的get
            // }
        }
        function Dep() {
            this.subs = [];
        }
        Dep.prototype.addSub = function (sub) {
            this.subs.push(sub);
        }
        Dep.prototype.notify = function () {
            this.subs.forEach(function (sub) {
                sub.update();
            })
        }

        let vm = new Vue({
            el: 'app',
            data: {
                text: 'hello world'
            }
        })