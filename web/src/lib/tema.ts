/**
 * Script inline do <head>: define data-tema no <html> ANTES da primeira
 * pintura, a partir de ?modo= na URL. Assim quem abre um link com
 * ?modo=roupas já vê o tema azul e o formulário de roupas, sem "piscar".
 *
 * Não usa dados do usuário: só compara o parâmetro com o valor fixo "roupas".
 */
export const SCRIPT_TEMA_INICIAL =
  '(function(){try{var m=new URLSearchParams(location.search).get("modo");' +
  'document.documentElement.setAttribute("data-tema",m==="roupas"?"roupas":"vestidos")}catch(e){}})();';
