


function checkchoose(m, n)  {
    if(m==1){return 0}
    if(n==m){return 1}
    if(n>m){return -1}
    a =n
    for (var i=2;i<=n/2;i++){
      a=a*(n-i+1)/i
      if(a==m){return i}
      if(a>m){return -1}
    }
    return -1
}


a = 47129212243960
console.log(checkchoose(a, 50) )