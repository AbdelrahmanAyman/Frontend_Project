import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuService } from '../service/menu';
import { AuthService } from '../service/auth';
import { CartService } from '../service/cart';
import { MenuItem } from '../models';

@Component({
  selector: 'app-menu-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './menu-list.html',
  styleUrl: './menu-list.css'
})
export class MenuList implements OnInit {
  menuService = inject(MenuService);
  authService = inject(AuthService);
  cartService = inject(CartService);

  items = signal<MenuItem[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string>('');

  searchTerm = signal<string>('');
  activeCategory = signal<string>('all');

  categories = computed(() => {   // a unique list of categories
    const set = new Set(this.items().map((i) => i.category));
    return Array.from(set);
  });

  filteredItems = computed(() => {    // filter items with its category
    const term = this.searchTerm().trim().toLowerCase();
    const category = this.activeCategory();

    return this.items().filter((item) => {
      if (category !== 'all' && item.category !== category) return false;
      if (!term) return true;

      const haystack = [item.name, item.description, ...(item.ingredients ?? [])]
        .join(' ')
        .toLowerCase();

      return haystack.includes(term);
    });
  });

  ngOnInit() {    // loads the menu when the page opened
    this.loadItems();
  }

  private loadItems() {   // fetches all menu items from the server
    this.isLoading.set(true);
    this.menuService.getMenuItems().subscribe({
      next: (data) => {
        this.items.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load menu items');
        this.isLoading.set(false);
      }
    });
  }

  setCategory(category: string) {   // switch to the chosen category
    this.activeCategory.set(category);
  }

  onSearchInput(event: Event) {   // fetch the menu by searching
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
  }

  selectedItem = signal<MenuItem | null>(null);
  selectedSizeIndex = signal<number>(0);
  selectedToppings = signal<Set<string>>(new Set());
  quantity = signal<number>(1);

  itemBasePrice = computed(() => {   // price the items
    const item = this.selectedItem();
    if (!item) return 0;
    if (item.sizes && item.sizes.length > 0) {
      return item.sizes[this.selectedSizeIndex()]?.price ?? item.price;
    }
    return item.price;
  });

    // calculate the total price for total quantity of item 
  lineTotal = computed(() => (this.itemBasePrice() ) * this.quantity());

  openItem(item: MenuItem) {
    this.selectedItem.set(item);
    this.selectedSizeIndex.set(0);
    this.selectedToppings.set(new Set());
    this.quantity.set(1);
  }

  closeItem() {   // close the item's detail
    this.selectedItem.set(null);
  }

  
  incrementQty() {
    this.quantity.update((q) => q + 1);
  }

  decrementQty() {
    this.quantity.update((q) => Math.max(1, q - 1));
  }

  addSelectedToCart() {   // add the item to the cart
    const item = this.selectedItem();
    if (!item?._id) return;

    const sizeLabel =
      item.sizes && item.sizes.length > 0 ? item.sizes[this.selectedSizeIndex()].label : item.size ?? 'Regular';

    this.cartService.add({
      menuItemId: item._id,
      name: item.name,
      size: sizeLabel,
      toppings: Array.from(this.selectedToppings()),
      price: this.itemBasePrice() ,
      qty: this.quantity()
    });

    this.closeItem();
  }

  showAdminForm = signal<boolean>(false);
  editingId = signal<string | null>(null);
  saving = signal<boolean>(false);
  formError = signal<string>('');

  formName = '';
  formCategory = '';
  formDescription = '';
  formPrice: number | null = null;
  formSize = '';
  formIngredients = '';
  selectedFile: File | null = null;
  imagePreview = signal<string | null>(null);

  openAddForm() {   // the add item's form
    this.resetAdminForm();
    this.showAdminForm.set(true);
  }

  openEditForm(item: MenuItem, event: Event) {    // the edit item's form
    event.stopPropagation();
    this.editingId.set(item._id ?? null);
    this.formName = item.name;
    this.formCategory = item.category;
    this.formDescription = item.description;
    this.formPrice = item.price;
    this.formSize = item.size ?? '';
    this.formIngredients = (item.ingredients ?? []).join(', ');
    this.selectedFile = null;
    this.imagePreview.set(this.menuService.getImageUrl(item.imageUrl));
    this.formError.set('');
    this.showAdminForm.set(true);
  }

  closeAdminForm() {
    this.showAdminForm.set(false);
    this.resetAdminForm();
  }

  private resetAdminForm() {
    this.editingId.set(null);
    this.formName = '';
    this.formCategory = '';
    this.formDescription = '';
    this.formPrice = null;
    this.formSize = '';
    this.formIngredients = '';
    this.selectedFile = null;
    this.imagePreview.set(null);
    this.formError.set('');
  }

  onFileSelected(event: Event) {    // stores the chosen image and generates a local URL for it
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      this.selectedFile = target.files[0];
      this.imagePreview.set(URL.createObjectURL(this.selectedFile));
    }
  }

  submitAdminForm() {   // validates the form
    if (!this.formName || !this.formCategory || this.formPrice === null) {
      this.formError.set('Please fill in name, category, and price.');
      return;
    }

    const formData = new FormData();
    formData.append('name', this.formName);
    formData.append('category', this.formCategory);
    formData.append('description', this.formDescription);
    formData.append('price', String(this.formPrice));
    if (this.formSize) formData.append('size', this.formSize);
    if (this.formIngredients) formData.append('ingredients', this.formIngredients);
    if (this.selectedFile) formData.append('imageUrl', this.selectedFile);

    this.saving.set(true);
    const id = this.editingId();

    const request = id
      ? this.menuService.updateMenuItem(id, formData)
      : this.menuService.createMenuItem(formData);

    request.subscribe({
      next: (savedItem) => {
        this.saving.set(false);
        this.items.update((list) =>
          id ? list.map((i) => (i._id === id ? savedItem : i)) : [savedItem, ...list]
        );
        this.closeAdminForm();
      },
      error: (err) => {
        this.saving.set(false);
        this.formError.set(err.error?.message || 'Failed to save item');
      }
    });
  }

  deleteItem(item: MenuItem, event: Event) {    // confirm the order then delete it from the cart page
    event.stopPropagation();
    if (!item._id) return;

    const confirmed = confirm(`Delete "${item.name}"? This can't be undone.`);
    if (!confirmed) return;

    this.menuService.deleteMenuItem(item._id).subscribe({
      next: () => {
        this.items.update((list) => list.filter((i) => i._id !== item._id));
      },
      error: () => {
        this.errorMessage.set('Failed to delete item');
      }
    });
  }
}