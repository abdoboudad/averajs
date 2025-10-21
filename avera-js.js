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
    async render() {
        let html = this.template;
        for(const key in this.data){
            html = html.replaceAll(`{{${key}}}`,this.data[key])
        }
        this.el.innerHTML = html
        this.collectRefs()
        this.Avloop()
        // await this.loadComponents()
    }

    collectRefs(){
        this.refs = {};
        const refElements = this.el.querySelectorAll('[ref]');
        refElements.forEach((element) => {
            const name = element.getAttribute('ref')
            this.refs[name] = element            
        });
    }

    Avloop(){
        const loops = this.el.querySelectorAll("[av-loop]");
        loops.forEach((loopEl)=>{
            const loopExp = loopEl.getAttribute("av-loop").trim();
            const [itemName,arrayName] = loopExp.split(" in ").map(s=>s.trim())
            const array = this.data[arrayName]

            if(Array.isArray(array)){
                const parent = loopEl.parentNode;
                array.forEach((val)=>{
                    const clone = loopEl.cloneNode(true);
                    clone.innerHTML = clone.innerHTML.replaceAll(`{{${itemName}}}`,val)
                    parent.insertBefore(clone,loopEl)
                })
            }
            loopEl.remove()
        })

        let html = this.el.innerHTML;
        for(const key in this.data){
            html = html.replaceAll(`{{${key}}}`,this.data[key])
        }
        this.el.innerHTML = html
    }
    // async loadComponents(){
    //     const customTags = this.el.querySelectorAll('*');
    //     for(const el of customTags){
    //         const tagName = el.tagName.toLowerCase();
    //         if(!["div","span","p","h1","h2","h3","h4","h5","h6","a","ul","li","button","section","article"].includes(tagName)){
    //             const fileName = `${tagName}.html`;
    //             try{
    //                 const response = await fetch(fileName);
    //                 const html = await response.text();
    //                 el.innerHTML = html;
    //                 console.log(html);
                    
    //                 this.collectRefs()
    //             }catch(err){
    //                 console.err(`Failed to load component ${tagName}:`, err);
                    
    //             }
    //         }
    //     }
    // }
}

