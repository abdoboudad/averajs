class Averajs{
    constructor(options){
        this.el = document.querySelector(options.el)
        this.data = options.data;
        this.template = this.el.innerHTML;
        this.refs = {};

        this.render()
        this.observe()
    }

    observe(){
        for(const key in this.data){
            let value = this.data[key]
            Object.defineProperty(this.data,key,{
                get: ()=>value,
                set: (newVal)=>{
                    value = newVal;
                    this.render();
                }
            })
        }
    }
    render() {
        let html = this.template;
        for(const key in this.data){
            html = html.replaceAll(`{{${key}}}`,this.data[key])
        }
        this.el.innerHTML = html
        this.collectRefs()
        this.loadComponents()
    }

    collectRefs(){
        this.refs = {};
        const refElements = this.el.querySelectorAll('[ref]');
        refElements.forEach((element) => {
            const name = element.getAttribute('ref')
            this.refs[name] = element            
        });
    }

    async loadComponents(){
        const customTags = this.el.querySelectorAll('*');
        for(const el of customTags){
            const tagName = el.tagName.toLowerCase();
            if(!["div","span","p","h1","h2","h3","h4","h5","h6","a","ul","li","button","section","article"].includes(tagName)){
                const fileName = `${tagName}.html`;
                try{
                    const response = await fetch(fileName);
                    const html = await response.text();
                    el.innerHTML = html;
                    this.collectRefs()
                }catch(err){
                    console.err(`Failed to load component ${tagName}:`, err);
                    
                }
            }
        }
    }
}

