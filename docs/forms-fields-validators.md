# Como podemos controlar formulários?

- De maneira simples, podemos usar Reactive Forms do Angular.
- Não precisamos de bibliotecas externas para validação, pois o Angular em si
  já oferece um conjunto robusto de validators.

## Exemplo

```ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

// Precisamos importar ReactiveFormsModule para usar FormBuilder e Validators
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  // Para cada entidade, criamos um componente de formulário específico
  // depois este componente pode ser usado dentro de um modal, página ou
  // onde for necessário
  selector: 'some-entity-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: `
    <form [formGroup]="someEntityForm" (ngSubmit)="onSubmit()">
      <!-- Para cada campo da entidade, criamos um input associado a um formControlName -->

      <!-- Nome da Área — obrigatório -->
      <label>Nome da Área <span class="text-red-500">*</span></label>
      <input formControlName="nomeArea" placeholder="Ex: Talhão Norte" />
      @if (form.get('nomeArea')?.invalid && form.get('nomeArea')?.touched) {
        <p>Nome é obrigatório.</p>
      }

      <!-- Área ativa — boolean (checkbox) -->
      <label>
        <input type="checkbox" formControlName="ativo" />
        Área ativa
      </label>

      <!-- Descrição — máximo de 25 caracteres -->
      <label>Descrição</label>
      <input formControlName="descricao" placeholder="Máx. 25 caracteres" />
      @if (form.get('descricao')?.hasError('maxlength')) {
        <p>A descrição pode ter no máximo 25 caracteres.</p>
      }

      <!-- Código do Talhão — pattern -->
      <label>Código do Talhão</label>
      <input formControlName="codigoTalhao" placeholder="Ex: S3AC01" />
      @if (form.get('codigoTalhao')?.hasError('pattern')) {
        <p>Formato inválido, precisa seguir a taxonomia.</p>
      }

      <button type="submit" [disabled]="form.invalid">Cadastrar</button>
    </form>
  `,
})
export class CadastroFlorestalComponent {
  private fb = inject(FormBuilder);

  // Para cada propriedade da entidade, criamos um campo no FormGroup e
  // associamos os validators
  someEntityForm = this.fb.group({
    // Campo obrigatório
    nomeArea: ['', Validators.required],

    // Campo boolean (podemos inicializar com valores padrão)
    ativo: [false],

    // Texto com máximo de 25 caracteres
    descricao: ['', Validators.maxLength(25)],

    // Pattern para código do talhão (ex: S3AC01)
    codigoTalhao: ['', Validators.pattern(/^[A-Za-z][0-9][A-Za-z]{2}[0-9]{2}$/)],
  });

  // No submit podemos acessar os valores do formulário e realizar ações como
  // enviar para API
  onSubmit(): void {
    if (this.form.valid) {
      console.log('Cadastro florestal:', this.form.value);
    }
  }
}
```

- Existe também a possibilidade de criar validators personalizados.

## Validators Built-in

| Validator                        | Assinatura     | O que valida                   |
| -------------------------------- | -------------- | ------------------------------ |
| `Validators.required`            | `required`     | Campo não vazio                |
| `Validators.requiredTrue`        | `requiredTrue` | Checkbox marcado (`true`)      |
| `Validators.email`               | `email`        | Formato de e-mail básico       |
| `Validators.minLength(n)`        | `minlength`    | Mínimo de `n` caracteres       |
| `Validators.maxLength(n)`        | `maxlength`    | Máximo de `n` caracteres       |
| `Validators.min(n)`              | `min`          | Valor numérico ≥ `n`           |
| `Validators.max(n)`              | `max`          | Valor numérico ≤ `n`           |
| `Validators.pattern(regex)`      | `pattern`      | Deve casar com a RegExp        |
| `Validators.nullValidator`       | —              | Sempre válido (placeholder)    |
| `Validators.compose([...])`      | —              | Combina array de validators    |
| `Validators.composeAsync([...])` | —              | Combina validators assíncronos |

## Tabela: Tipo de Dado × Validator Recomendado

| Tipo / Campo            | Validators recomendados                                  | Observação                                                          |
| ----------------------- | -------------------------------------------------------- | ------------------------------------------------------------------- |
| string / texto livre    | `required`, `minLength`, `maxLength`, `pattern`          | Ex: nome, descrição                                                 |
| e-mail                  | `required`, `email`, `maxLength(254)`                    | `email` valida formato básico; use custom para domínios específicos |
| senha                   | `required`, `minLength(8)`, `pattern`                    | Pattern para exigir letras + números + símbolos                     |
| número inteiro          | `required`, `min`, `max`, `pattern(/^\d+$/)`             | `min` / `max` operam sobre o valor numérico                         |
| número decimal          | `required`, `min`, `max`, `pattern(/^\d+(\.\d{1,2})?$/)` | Controla casas decimais via pattern                                 |
| CPF / CNPJ              | custom validator                                         | Dígitos verificadores exigem lógica própria                         |
| telefone                | `pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)`                  | Ajuste a máscara conforme formatação usada                          |
| CEP                     | `pattern(/^\d{5}-?\d{3}$/)`                              |                                                                     |
| URL                     | `pattern(urlRegex)`                                      | Não há built-in; use regex ou custom                                |
| data (string)           | `pattern`, custom validator                              | Valida formato e existência da data                                 |
| checkbox                | `requiredTrue`                                           | Garante que foi marcado                                             |
| select / enum           | custom validator (`allowedValues`)                       | Verifica se o valor está na lista permitida                         |
| confirmação (ex: senha) | custom validator no `FormGroup`                          | Compara dois controles cruzados                                     |

## Tipo de Dado × Componente de Input (Forms - PrimeNG)

| Tipo de Dado                         | Componente PrimeNG                 | Import         | Observação                                 |
| ------------------------------------ | ---------------------------------- | -------------- | ------------------------------------------ |
| string curta (nome, título)          | `p-inputtext`                      | `InputText`    | Campo texto padrão                         |
| string longa (descrição, observação) | `p-textarea`                       | `Textarea`     | Com `autoResize`                           |
| e-mail                               | `p-inputtext` + `Validators.email` | `InputText`    | Sem componente específico, usar validator  |
| senha                                | `p-password`                       | `Password`     | Exibe indicador de força                   |
| número inteiro                       | `p-inputnumber`                    | `InputNumber`  | `[useGrouping]="false"`                    |
| número decimal / moeda               | `p-inputnumber`                    | `InputNumber`  | `mode="currency"` ou `minFractionDigits`   |
| telefone / CPF / CEP                 | `p-inputmask`                      | `InputMask`    | Máscara configurável ex: `(99) 99999-9999` |
| data                                 | `p-datepicker`                     | `DatePicker`   | Substitui o antigo `p-calendar`            |
| data + hora                          | `p-datepicker`                     | `DatePicker`   | `[showTime]="true"`                        |
| intervalo de datas                   | `p-datepicker`                     | `DatePicker`   | `selectionMode="range"`                    |
| boolean / ativo                      | `p-toggleswitch`                   | `ToggleSwitch` | Para flags on/off                          |
| boolean / aceite de termos           | `p-checkbox`                       | `Checkbox`     | Com `Validators.requiredTrue`              |
| enum / lista pequena (≤5 opções)     | `p-selectbutton`                   | `SelectButton` | Visual em botões                           |
| enum / lista média                   | `p-select`                         | `Select`       | Substitui o antigo `p-dropdown`            |
| enum / lista grande                  | `p-select` com filtro              | `Select`       | `[filter]="true"`                          |
| multi-seleção                        | `p-multiselect`                    | `MultiSelect`  | Lista com checkboxes                       |
| hierarquia / árvore                  | `p-treeselect`                     | `TreeSelect`   | Dados em estrutura pai-filho               |
| autocomplete / busca                 | `p-autocomplete`                   | `AutoComplete` | Ideal para FK com muitos registros         |
| cor                                  | `p-colorpicker`                    | `ColorPicker`  | Retorna hex/rgb                            |
| rating / avaliação                   | `p-rating`                         | `Rating`       | Estrelas de 0–N                            |
| range numérico                       | `p-slider`                         | `Slider`       | `[range]="true"` para intervalo            |
| porcentagem / knob                   | `p-knob`                           | `Knob`         | Visual circular                            |
| arquivo / imagem                     | `p-fileupload`                     | `FileUpload`   | Upload com drag-and-drop e preview         |
| OTP / código                         | `p-inputotp`                       | `InputOtp`     | Campos separados por dígito                |
| radio exclusivo visual               | `p-radiobutton`                    | `RadioButton`  | Iterado via `*ngFor`                       |

## Componentes para a Tela de LIST + Ações CRUD

## Tabela: Necessidade × Componente PrimeNG (CRUD / Listagem)

| Necessidade                     | Componente PrimeNG                        | Observação                                                     |
| ------------------------------- | ----------------------------------------- | -------------------------------------------------------------- |
| Tabela principal                | `p-table`                                 | Componente central — sorting, filtering, pagination integrados |
| Paginação                       | `p-table` nativo ou `p-paginator`         | `[paginator]="true"` direto na table, ou standalone            |
| Filtro global / por coluna      | `p-table` com `[globalFilter]`            | Filtro embutido, por coluna com `pInputText`                   |
| Seleção de linhas               | `p-table`                                 | `selectionMode="single"` ou `"multiple"`                       |
| Ordenação                       | `p-table`                                 | `[sortable]="true"` por coluna                                 |
| Loading / skeleton              | `p-skeleton`                              | Exibir enquanto dados carregam                                 |
| Scroll em tabela grande         | `p-scroller` (VirtualScroller)            | Para listas com milhares de registros                          |
| Botão Novo                      | `p-button`                                | `icon="pi pi-plus"`                                            |
| Botão Editar (linha)            | `p-button`                                | `severity="secondary"`, `icon="pi pi-pencil"`                  |
| Botão Visualizar (linha)        | `p-button`                                | `severity="info"`, `icon="pi pi-eye"`                          |
| Botão Excluir (linha)           | `p-button`                                | `severity="danger"`, `icon="pi pi-trash"`                      |
| Confirmação de delete           | `p-confirmdialog` + `ConfirmationService` | Serviço injetável, reutilizável em toda entidade               |
| Confirmação inline              | `p-confirmpopup`                          | Popup relativo ao botão — alternativa mais leve                |
| Feedback de ação (salvo, erro)  | `p-toast` + `MessageService`              | Injetável globalmente                                          |
| Mensagem inline                 | `p-message`                               | Dentro do form para erros de campo/servidor                    |
| Modal de form (Create/Edit)     | `p-dialog` ou `p-dynamicdialog`           | DynamicDialog carrega componente via serviço                   |
| Drawer lateral (form em painel) | `p-drawer`                                | Alternativa ao Dialog para forms laterais                      |
| Tags / status                   | `p-tag`                                   | Ex: `severity="success"` para Ativo / `"danger"` para Inativo  |
| Badge em botão                  | `p-badge`                                 | Contador de itens selecionados etc.                            |
| Toolbar de ações                | `p-toolbar`                               | Agrupa botões de ação no topo da tela                          |
| Breadcrumb                      | `p-breadcrumb`                            | Navegação contextual entre list → form                         |
| Menu de ações por linha         | `p-menu` ou `p-tieredmenu`                | `[popup]="true"` acionado por botão "..."                      |
| Split button                    | `p-splitbutton`                           | Botão principal + dropdown de ações secundárias                |

## Referências

- https://angular.dev/api/forms/Validators
- https://angular.dev/api/forms/FormBuilder
- https://angular.dev/api/forms/ReactiveFormsModule
