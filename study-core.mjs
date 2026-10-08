export function toggle(revealed,id){const next=new Set(revealed);next.has(id)?next.delete(id):next.add(id);return next;}
export function revealNext(revealed,labels){const next=new Set(revealed);const label=labels.find(item=>!next.has(item.id));if(label)next.add(label.id);return {revealed:next,label};}
export function setPage(revealed,labels,show){const next=new Set(revealed);for(const {id} of labels)show?next.add(id):next.delete(id);return next;}
