const app = Vue.createApp({
    data(){
        return {
            nodeData:{
                nodes: [
                    { id: 'm', name: '质量', type:'element', group:'g1'},
                    { id: 'a', name: '加速度', type:'element', group:'g1'},
                    { id: 'F', name: '力', type:'element', group:'g1'},
                    { id: 'n2l', name: "牛顿第二定律", type:'equation', latex:'F=ma', group:'g1'},
                    { id: 'Newton', name: '牛顿', type:'object'},
                    { id: 'spdChange', name: '改变速度', content: '力作用到物体上，使物体速度产生变化，加速度即单位时间内速度的变化量', type:'process'},
                    { id: 'England', range: '英格兰', type: 'space'},
                    { id: 'area', range: ['华北平原','长江中下游地区'], type: 'space'},
                    { id: 'area2', range: ['60N', '130E','10N','70E'], type: 'space'},
                    { id: 't1', range: ['2022年5月','2022年6月'],type:'time',name:'某时间段'}
                ],
                links: [
                    { from: 'm', to: 'n2l' , type: 1},
                    { from: 'a', to: 'n2l' , type: 1},
                    { from: 'n2l', to: 'F' , type: 3},
                    { from: 'Newton', to: 'n2l', type: 2},
                    { from: 'F', to: 'spdChange', type: 2},
                    { from: 'spdChange', to: 'a', type: 2},
                    { from: 'Newton', to: 'England', type: 4},
                    { from: 't1', to: 'area'},
                    { from: 'area', to: 'area2'}
                ],
                group: [
                    { id: 'g1', label:'物理'}
                ]
            },
            nodeTypeSelect: "all",
            SL: new SciLink(),
            showAddDialog: false,
            nodeType:[
                {value: "element",label: "物理量"},
                {value: "equation",label: "公式"},
                {value: "object",label: "事物"},
                {value: "space",label: "空间"},
                {value: "time",label: "时间"},
                {value: "process",label: "过程"},
            ],
            newNodeForm:{},
            nodeColors: {
                element: "#C4DCEB",
                equation: "#46B692",
                process: "#ba7ece",
                space: "#397fc6",
                time: "#288a59",
                object: "#d6ad85"
            },
            formRule: {
                type: [
                    { required: true, message: "请选择所属类型", trigger: "change" },
                ],
                id: [
                    { required: true, message: "请输入id", trigger: "blur" },
                ],
                latex: [
                    { required: true, message: "请输入公式", trigger: "blur" },
                ],
                time: [
                    { required: true, trigger: "blur", message: "请输入时间"},
                ],
                space: [
                    { required: true, trigger: "blur", message: "请输入范围"},
                ],
                content: [
                    { required: true, message: "请输入内容", trigger: "blur" },
                ],
      },
        };
    },
    computed:{
        renderNodeList(){
            let nodes = [];
            let type = this.nodeTypeSelect;
            this.nodeData.nodes.forEach((val)=>{
                if (type == "all" || type == val.type){
                    let rangeName = "";
                    // 时空节点
                    if (!val.name && val.range && typeof(val.range)=='object'){
                        if(val.range.length == 1){
                            rangeName = this.cutString(val.range[0]);
                        }else if(val.range.length < 4){
                            rangeName = this.cutString(val.range[0]+"~"+val.range[1])
                        }else{
                            rangeName = this.cutString(val.range[0]+"~"+val.range[2]+" "+val.range[1]+"~"+val.range[3])
                        }
                    }
                    else if(!val.name && val.range && typeof(val.range)=='string'){
                        rangeName = this.cutString(val.range);
                    }
                    let node = {
                        id: val.id,
                        name: val.name || rangeName,
                        type: val.type,
                        content: val.content || "",
                    };
                    // 渲染公式
                    if (val.type == "element" || val.type == "equation"){
                        let tex = this.SL.latex2Svg(val.latex||val.id);
                        node.base64 = tex.base64;
                    }
                    nodes.push(node);
                }
            });
            return nodes;
        }
    },
    methods:{
        cutString(text, n=12){
            if (text.length > n){
                return text.substr(0, n-1)+"…";
            }else{
                return text;
            }
        },
        openAddNode(){
            this.showAddDialog = true;
            this.newNodeForm = {
                type: 'element',
                id: '',
                name: '',
                latex: '',
                range: '',
                height: '',
                content: '',
                group: '',
                inGroup: false,
                color: this.nodeColors.element,
                padding: 5,
                fontSize: 12,
                base64: '',
                timeType: 1,
                timeRange1: '',
                timeRange2: ['', ''],
                spaceType: 1,
                spaceRange1: '',
                spaceRange2: ['', ''],
                spaceRange3: ['', '', '', ''],
                height: 16,
                wrap: 12,
                latexHeight:1
            }
        },
        addNodeChangeType(){
            this.newNodeForm.color = this.nodeColors[this.newNodeForm.type];
        },
        svgPreview(){
            console.log(this.newNodeForm.latex)
            let s = this.SL.latex2Svg(this.newNodeForm.latex);
            this.newNodeForm.base64 = s.base64;
        },
        closeAddNode(){
            this.showAddDialog = false;
        },
        addNode(){
            this.$refs['addNode'].validate((data)=>{
                console.log(data);
                if(data){
                    if (this.newNodeForm.type == "element" || this.newNodeForm.type == "equation"){
                        this.newNodeForm.height = this.newNodeForm.latexHeight * 25;
                    }
                    this.nodeData.nodes.push(this.newNodeForm);
                    this.$message({
                        message: "添加成功",
                        type: "success"
                    })
                    this.closeAddNode();
                    this.refreshGraph(this.nodeData);
                    console.log(this.nodeData)
                }else{
                    this.$message.error("添加失败，请检查输入数据！")
                }
            })
        },
        refreshGraph(data){
            // this.SL.refresh(data);
            this.SL.data(this.nodeData);
            this.SL.render();
        }
    },
    mounted(){
        this.SL.mount({
            container: 'nodeCanvas'
        })
        this.SL.data(this.nodeData);
        this.SL.render();

    }
})
app.use(ElementPlus);
app.mount("#app");