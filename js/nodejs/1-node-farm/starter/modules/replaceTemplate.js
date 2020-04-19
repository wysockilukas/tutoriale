module.exports = (html,jsonData) => {
    let output = [];
        jsonData.forEach( (page) => {
            let onePage = html
            Object.keys(page).forEach( (param) => {
                const find = `{%${param}%}`
                if (param==="organic" && !page[param] ) {
                    onePage = onePage.replace(  new RegExp(find,'g')   , 'not-organic')   
                }
                onePage = onePage.replace(  new RegExp(find,'g')   , page[param])
            })
            output.push(onePage)
        })
    return output;
  }