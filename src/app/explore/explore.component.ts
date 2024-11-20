import { Component, HostListener, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { CommonModule, NgOptimizedImage, provideImgixLoader } from '@angular/common'; // Import CommonModule
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { DataShareService } from '../services/data.share.service';

interface Category {
  title: string;
  image: string;
  route: string;
  label: string;
}

interface DressCategory {
  title: string;
  image: string;
  route: string;
}

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './explore.component.html',
  styleUrl: './explore.component.css'
})
export class ExploreComponent implements OnInit{

  public loggedInUserId = localStorage.getItem('loggedInUserId');
  public activeTab = 'explore';
  public activeFashionTab :any;
  public activeSidebarCategories: any;
  public activeDressCategory: any;

  mainCategories: Category[] = [
    { title: 'Men Fashion', image: 'men-fashion-icon', route: '/men', label: 'Men' },
    { title: 'Women Fashion', image: 'women-fashion-icon', route: '/women', label: 'Women' },
    { title: 'Kids Fashion', image: 'kids-fashion-icon', route: '/kids', label: 'Kids' },
  ];

  // sidebarCategories: string[] = [
  //   'Dresses', 'Tops', 'Bottoms', 'Jackets', 'Ethnic', 'Lingerie', 'Jewellery'
  // ];

  // dressCategories: DressCategory[] = [
  //   { title: 'Maxi Dress', image: 'maxi-dress-logo', route: '/maxi-dress' },
  //   { title: 'Playsuit', image: 'playsuits-logo', route: '/playsuits' },
  //   { title: 'Jumpsuit', image: 'jumpsuits-logo', route: '/jumpsuits' },
  //   { title: 'Mini Dress', image: 'mini-dress-logo', route: '/mini-dress' },
  //   { title: 'Midi Dress', image: 'midi-dress-logo', route: '/midi-dress' },
  //   { title: 'See all >', image: 'women-dress-see-all-logo', route: '/see-all' }

  // ];

  // sidebarCategories: string[] = [
  //   'Dresses', 'Tops', 'Bottoms', 'Jackets', 'Ethnic', 'Lingerie', 'Jewellery'
  // ];

  sidebarCategories: any = {
    'Men' : ['Topwear', 'Bottomwear', 'Ethnic', 'Innerwear', 'Winterwear', 'Footwear', 'Fashion Accessories'],
    'Women' : ['Dresses', 'Tops', 'Bottoms', 'Co ords', 'Ethnic', 'Winterwear', 'Lingerie', 'Footwear', 'Fashion Accessories'],
    'Kids' : ['Boys Clothing', 'Girls Clothing', 'Footwear', 'Toys & Games', 'Infants', 'Accessories']
  }

  dressCategories: { [key: string]: Array<{ title: string, image: string, route: string }> } = {

    'Men-Topwear': [
      { title: 'Casual Shirts', image: 'men-casual-shirts-logo', route: '/casual-shirts' },
      { title: 'Formal Shirts', image: 'men-formal-shirts-logo', route: '/formal-shirts' },
      { title: 'T-shirts', image: 'men-t-shirts-logo', route: '/t-shirts' },
      { title: 'Blazers & Coats', image: 'men-blazers-coats-logo', route: '/blazers-coats' },
      { title: 'Suits', image: 'men-suits-logo', route: '/suits' },
      { title: 'Sweatshirts', image: 'men-sweatshirts-logo', route: '/sweatshirts' },
      { title: 'See all >', image: 'men-topwear-see-all-logo', route: '/see-all' }
    ],
    'Men-Bottomwear': [
      { title: 'Shorts', image: 'men-shorts-logo', route: '/shorts' },
      { title: 'Jeans', image: 'men-jeans-logo', route: '/jeans' },
      { title: 'Track Pants & Joggers', image: 'men-trackpants-joggers-logo', route: '/trackpants-joggers' },
      { title: 'Trousers', image: 'men-trousers-logo', route: '/trousers' },
      { title: 'See all >', image: 'men-bottomwear-see-all-logo', route: '/see-all' }
    ],

    'Men-Ethnic': [
      { title: 'Kurta & Kurta Sets', image: 'men-kurtas-kurta-sets-logo', route: '/kurtas-kurta-sets' },
      { title: 'Sherwanis', image: 'men-sherwanis-logo', route: '/sherwanis' },
      { title: 'Dhotis', image: 'men-dhotis-logo', route: '/dhotis' },
      { title: 'Nehru Jackets', image: 'men-nehru-jackets-logo', route: '/nehru-jackets' },
      { title: 'See all >', image: 'men-ethnic-see-all-logo', route: '/see-all' }
    ], 
    'Men-Winterwear': [
      { title: 'Jackets', image: 'men-jackets-logo', route: '/jackets' },
      { title: 'Sweaters', image: 'men-sweaters-logo', route: '/sweaters' },
      { title: 'Blazers & coats', image: 'men-blazers-coats-new-logo', route: '/blazers-coats' },
      { title: 'Sweatshirts', image: 'men-sweatshirts-new-logo', route: '/sweatshirts' },
      { title: 'Thermals', image: 'men-thermals-logo', route: '/thermals' },
      { title: 'See all >', image: 'men-winterwear-see-all-logo', route: '/see-all' }
    ],
    'Men-Innerwear': [
      { title: 'Briefs & Trunks', image: 'men-briefs-trunks-logo', route: '/briefs-trunks' },
      { title: 'Boxers', image: 'men-boxers-logo', route: '/boxers' },
      { title: 'Vests', image: 'men-vests-logo', route: '/vests' },
      { title: 'Sleepwear & Loungewear', image: 'men-sleepwear-loungewear-logo', route: '/sleepwear-loungewear' },
      { title: 'See all >', image: 'men-innnerwear-see-all-logo', route: '/see-all' }
    ],
    'Men-Footwear': [
      { title: 'Sneakers', image: 'men-sneakers-logo', route: '/sneakers' },
      { title: 'Casual Shoes', image: 'men-casual-shoes-logo', route: '/casual-shoes' },
      { title: 'Sports Shoes', image: 'men-sports-shoes-logo', route: '/sports-shoes' },
      { title: 'Formal Shoes', image: 'men-formal-shoes-logo', route: '/formal-shoes' },
      { title: 'Flip Flops', image: 'men-flip-flops-logo', route: '/flip-flops' },
      { title: 'Sandals & Floaters', image: 'men-sandals-floaters-logo', route: '/sandals-floaters' },
      { title: 'Socks', image: 'men-socks-logo', route: '/socks' },
      { title: 'See all >', image: 'men-footwear-see-all-logo', route: '/see-all' }
    ],
    'Men-Fashion Accessories': [
      { title: 'Belts', image: 'men-belts-logo', route: '/belts' },
      { title: 'Perfumes & Deodorants', image: 'men-perfumes-deodorants-logo', route: '/perfumes-deodorants' },
      { title: 'Trimmers', image: 'trimmers-logo', route: '/trimmers' },
      { title: 'Wristwear', image: 'men-wristwear-logo', route: '/wristwear' },
      { title: 'Wallets', image: 'men-wallets-logo', route: '/wallets' },
      { title: 'Caps & Hats', image: 'men-caps-hats-logo', route: '/caps-hats' },
      { title: 'Gloves', image: 'men-gloves-logo', route: '/gloves' },
      { title: 'Ring', image: 'men-ring-logo', route: '/ring' },
      { title: 'See all >', image: 'men-fashion-see-all-logo', route: '/see-all' }
    ],

    'Women-Dresses': [
      { title: 'Maxi Dress', image: 'maxi-dress-logo', route: '/maxi-dress' },
      { title: 'Playsuit', image: 'playsuits-logo', route: '/playsuits' },
      { title: 'Jumpsuit', image: 'jumpsuits-logo', route: '/jumpsuits' },
      { title: 'Mini Dress', image: 'mini-dress-logo', route: '/mini-dress' },
      { title: 'Midi Dress', image: 'midi-dress-logo', route: '/midi-dress' },
      { title: 'Empire Dress', image: 'women-empire-dress-logo', route: '/empire-dress' },
      { title: 'Fit & Flare Dress', image: 'women-fit-flare-dress-logo', route: '/fit-flare-dress' },
      { title: 'Shirt Dress', image: 'women-shirt-dress-logo', route: '/shirt-dress' },
      { title: 'See all >', image: 'women-dress-see-all-logo', route: '/see-all' }
    ],
    'Women-Tops': [
      { title: 'T-shirts', image: 'women-t-shirts-logo', route: '/t-shirts' },
      { title: 'Shirts', image: 'women-shirt-logo', route: '/shirt' },
      { title: 'Shrug', image: 'women-shrug-logo', route: '/shrug' },
      { title: 'Tops', image: 'women-tops-logo', route: '/top' },
      { title: 'Tunics', image: 'women-tunic-logo', route: '/tunic' },
      { title: 'Waistcoat', image: 'women-waistcoat-logo', route: '/waistcoat' },
      { title: 'Blazers', image: 'women-blazers-logo', route: '/blazers' },
      { title: 'See all >', image: 'women-tops-see-all-logo', route: '/see-all' }
    ],
    'Women-Bottoms': [
      { title: 'Shorts', image: 'women-shorts-logo', route: '/shorts' },
      { title: 'Skirts', image: 'women-skirts-logo', route: '/skirts' },
      { title: 'Jeggings', image: 'women-jeggings-logo', route: '/jeggings' },
      { title: 'Leggings', image: 'women-leggings-logo', route: '/leggings' },
      { title: 'Palazzos', image: 'women-palazzos-logo', route: '/palazzos' },
      { title: 'Trousers', image: 'women-trousers-logo', route: '/trousers' },
      { title: 'Harem Pants', image: 'women-harem-pants-logo', route: '/harem-pants' },
      { title: 'See all >', image: 'women-bottoms-see-all-logo', route: '/see-all' }
    ],
    'Women-Co ords': [
      { title: 'Clothing Set', image: 'women-clothing-set-logo', route: '/clothing-set' }
      // { title: 'See all >', image: 'women-coords-see-all-logo', route: '/see-all' }
    ], 
    'Women-Ethnic': [
      { title: 'Salwar Suit', image: 'women-salwar-suit-logo', route: '/salwar-suit' },
      { title: 'Kurtis', image: 'women-kurtis-logo', route: '/kurtis' },
      { title: 'Lehenga', image: 'women-lehenga-logo', route: '/lehenga-choli' },
      { title: 'Dupatta', image: 'women-dupatta-logo', route: '/dupatta' },
      { title: 'Patiala Set', image: 'women-patiala-set-logo', route: '/patiala-set' },
      // { title: 'Salwars, Churidars & Dhotis', image: 'women-salwars-churidars-dhotis-logo', route: '/salwars-churidars-dhotis' },
      { title: 'Kurta Sets', image: 'women-kurta-sets-logo', route: '/kurtas-kurta-sets' },
      { title: 'Sarees', image: 'women-sarees-logo', route: '/sarees' },
      { title: 'Blouse', image: 'women-blouse-logo', route: '/saree-blouse' },
      { title: 'Dress Material', image: 'women-dress-material-logo', route: '/dress-material' },
      { title: 'Dhotis', image: 'women-dhotis-logo', route: '/dhotis' },
      { title: 'See all >', image: 'women-ethnic-see-all-logo', route: '/see-all' }
    ], 
    'Women-Winterwear': [
      { title: 'Jackets', image: 'women-jackets-logo', route: '/jackets' },
      { title: 'Sweaters', image: 'women-sweaters-logo', route: '/sweaters' },
      { title: 'Blazers', image: 'women-blazers-new-logo', route: '/blazers' },
      { title: 'Stoles', image: 'women-stoles-logo', route: '/stoles' },
      { title: 'Shawl', image: 'women-shawl-logo', route: '/shawl' },
      { title: 'See all >', image: 'women-winterwear-see-all-logo', route: '/see-all' }
    ],
    'Women-Lingerie': [
      { title: 'Bra', image: 'women-bra-logo', route: '/bra' },
      { title: 'Bralette', image: 'women-bralette-logo', route: '/bralette' },
      { title: 'Panties', image: 'women-panties-logo', route: '/panties' },
      { title: 'Slip Dress', image: 'women-slip-dress-logo', route: '/slip-dress' },
      { title: 'Matching Sets', image: 'women-matching-sets-logo', route: '/matching-sets' },
      { title: 'Shapewear', image: 'women-shapewear-logo', route: '/shapewear' },
      { title: 'See all >', image: 'women-lingerie-see-all-logo', route: '/see-all' }
    ],
    'Women-Footwear': [
      { title: 'Casual Shoes', image: 'women-casual-shoes-logo', route: '/casual-shoes' },
      { title: 'Sports Shoes', image: 'women-sports-shoes-logo', route: '/sports-shoes' },
      { title: 'Flats', image: 'women-flats-logo', route: '/flats' },
      { title: 'Heels', image: 'women-heels-logo', route: '/heels' },
      { title: 'Boots', image: 'women-boots-logo', route: '/boots' },
      { title: 'Floaters', image: 'women-floaters-logo', route: '/floaters' },
      { title: 'See all >', image: 'women-footwear-see-all-logo', route: '/see-all' }
    ],
    'Women-Fashion Accessories': [
      { title: 'Earrings', image: 'women-earrings-logo', route: '/earrings' },
      { title: 'Handbags', image: 'women-handbags-logo', route: '/handbags' },
      { title: 'Jewellery Set', image: 'women-jewellery-set-logo', route: '/jewellery-set' },
      { title: 'Watches', image: 'women-watches-logo', route: '/watches' },
      { title: 'Wallets', image: 'women-wallets-logo', route: '/wallets' },
      { title: 'Clutches', image: 'women-clutches-logo', route: '/clutches' },
      { title: 'Necklace & Chains', image: 'women-necklace-chains-logo', route: '/necklace-chains' },
      { title: 'Ring', image: 'women-ring-logo', route: '/ring' },
      { title: 'See all >', image: 'women-fashion-see-all-logo', route: '/see-all' }
    ],


    'Kids-Boys Clothing': [
      { title: 'Shirts', image: 'boy-shirts-logo', route: '/shirts' },
      { title: 'T-shirts', image: 'boy-t-shirts-logo', route: '/t-shirts' },
      { title: 'Jeans', image: 'boy-jeans-logo', route: '/jeans' },
      { title: 'Shorts', image: 'boy-shorts-logo', route: '/shorts' },
      { title: 'Trousers', image: 'boy-trousers-logo', route: '/trousers' },
      { title: 'Ethnic Wear', image: 'boy-ethnic-wear-logo', route: '/ethnic-wear' },
      { title: 'Track Pants & Pyjamas', image: 'boy-track-pants-pyjamas-logo', route: '/track-pants-pyjamas' },
      { title: 'Winter Wear', image: 'boy-winterwear-logo', route: '/winterwear' },
      { title: 'Party Wear', image: 'boy-party-wear-logo', route: '/party-wear' },
      { title: 'Innerwear', image: 'boy-innerwear-logo', route: '/innerwear' },
      { title: 'Sleepwear', image: 'boy-slipwear-logo', route: '/slipwear' },
      { title: 'See all >', image: 'boy-topwear-see-all-logo', route: '/see-all' }
    ],
    'Kids-Girls Clothing': [
      { title: 'Dresses', image: 'girl-dresses-logo', route: '/dresses' },
      { title: 'Tops', image: 'girl-tops-logo', route: '/tops' },
      { title: 'Tshirts', image: 'girl-tshirts-logo', route: '/tshirts' },
      { title: 'Co ords', image: 'girl-coords-logo', route: '/coords' },
      // { title: 'Lehenga Choli', image: 'girl-lehenga-choli-logo', route: '/lehenga-choli' },
      // { title: 'Kurta Sets', image: 'girl-kurta-sets-logo', route: '/kurta-sets' },
      { title: 'Ethnic Wear', image: 'girl-ethnic-wear-logo', route: '/ethnic-wear' },
      { title: 'Party Wear', image: 'girl-party-wear-logo', route: '/party-wear' },
      { title: 'Skirts & Shorts', image: 'girl-skirts-shorts-logo', route: '/skirts-shorts' },
      { title: 'Tights & Leggins', image: 'girl-tights-leggins-logo', route: '/tights-leggins' },
      { title: 'Jeans, Trousers & Capris', image: 'girl-jeans-trousers-capris-logo', route: '/jeans-trousers-capris' },
      { title: 'Winter Wear', image: 'girl-winterwear-logo', route: '/winterwear' },
      { title: 'Innerwear', image: 'girl-innerwear-logo', route: '/innerwear' },
      { title: 'Sleepwear', image: 'girl-sleepwear-logo', route: '/slipwear' },
      { title: 'See all >', image: 'girl-clothing-see-all-logo', route: '/see-all' }
    ],

    'Kids-Footwear': [
      { title: 'Casual', image: 'kids-casual-shoes-logo', route: '/casual-shoes' },
      { title: 'Sports Shoes', image: 'kids-sports-shoes-logo', route: '/sports-shoes' },
      { title: 'School Shoes', image: 'kids-school-shoes-logo', route: '/school-shoes' },
      { title: 'Flip Flops', image: 'kids-flip-flops-logo', route: '/flip-flops' },
      { title: 'Flats', image: 'kids-flats-logo', route: '/flats' },
      { title: 'Heels', image: 'kids-heels-logo', route: '/heels' },
      { title: 'Sandals & Floaters', image: 'kids-sandals-floaters-logo', route: '/sandals-floaters' },
      { title: 'Socks', image: 'kids-socks-logo', route: '/socks' },
      { title: 'See all >', image: 'kids-footwear-see-all-logo', route: '/see-all' }
    ],

    'Kids-Toys & Games': [
      { title: 'Learning & Development', image: 'kids-learning-development-logo', route: '/learning-development' },
      { title: 'Activity Toys', image: 'kids-activity-toys-logo', route: '/activity-toys' },
      { title: 'Soft Toys', image: 'kids-soft-toys-logo', route: '/soft-toys' },
      { title: 'Play set', image: 'kids-play-set-logo', route: '/play-set' },
      { title: 'See all >', image: 'kids-toys-see-all-logo', route: '/see-all' }
    ],
    'Kids-Infants': [
      { title: 'BodySuits', image: 'kids-bodySuits-logo', route: '/bodySuits' },
      { title: 'SleepSuits', image: 'kids-sleepSuits-logo', route: '/sleepSuits' },
      { title: 'Clothing Sets', image: 'kids-clothing-sets-logo', route: '/clothing-sets' },
      { title: 'Tshirts & Tops', image: 'kids-tshirts-tops-logo', route: '/tshirts-tops' },
      { title: 'Dresses', image: 'kids-dresses-logo', route: '/dresses' },
      { title: 'Bottomwear', image: 'kids-bottomwear-logo', route: '/bottomwear' },
      { title: 'Winterwear', image: 'kids-winterwear-logo', route: '/winterwear' },
      { title: 'Innerwear', image: 'kids-innerwear-logo', route: '/innerwear' },
      { title: 'Infant Care', image: 'kids-infant-care-logo', route: '/infant-care' },
      { title: 'See all >', image: 'kids-infants-see-all-logo', route: '/see-all' }
    ],
  
    'Kids-Accessories': [
      { title: 'Bags & Backpacks', image: 'kids-bags-backpacks-logo', route: '/bags-backpacks' },
      { title: 'Watches', image: 'kids-watches-logo', route: '/watches' },
      { title: 'Jewellery', image: 'kids-jewellery-logo', route: '/jewellery' },
      { title: 'Hair Accesory', image: 'kids-hair-accesory-logo', route: '/hair-accesory' },
      { title: 'Sunglasses', image: 'kids-sunglasses-logo', route: '/sunglasses' },
      { title: 'Caps & Hats', image: 'kids-caps-hats-logo', route: '/caps-hats' },
      { title: 'See all >', image: 'kids-fashion-see-all-logo', route: '/see-all' }
    ],
  };

  public constructor(private apiService: ApiService, private router: Router, private dataShareService: DataShareService) {}


  ngOnInit(): void {
    // (this.activeFashionTab + '-' + this.activeSidebarCategories)
    let savedFilters = this.dataShareService.getFilters();
    if(savedFilters && Object.keys(savedFilters).length > 0){
      this.activeDressCategory = savedFilters?.activeDressCategory;
      this.activeFashionTab = savedFilters?.activeFashionTab;
      this.activeSidebarCategories = savedFilters?.activeSidebarCategories;
    }else{
      this.activeFashionTab = 'Women';
      this.activeSidebarCategories = 'Dresses';
    }
  }

  changeFashionTab(tab: any){
    this.activeFashionTab = tab;
    if(this.activeFashionTab == 'Men'){
      this.activeSidebarCategories = 'Topwear';
    }
    else if(this.activeFashionTab == 'Women'){
      this.activeSidebarCategories = 'Dresses';
    }
    else{
      this.activeSidebarCategories = 'Boys Clothing';
    }
  }
  
  changeFooterTab(tab: any){
    this.activeTab = tab;
  }

  changeSidebarTab(tab: any){
    this.activeSidebarCategories = tab;
  }

  goToWishlistPage(){
    return this.router.navigate(['/wishlist']);
  }

  goToBagPage(){
    return this.router.navigate(['/cart']);
  }

  goToSearchPage(){
    return this.router.navigate(['/search'] );
  }

  gotoProfilePage(){
    return this.router.navigate(['/profile']);
  }
  
  gotoHomePage(){
    return this.router.navigate(['/home']);
  }

  gotoCategoryProductPage(dressCategory: any){
    this.activeDressCategory = dressCategory.title;
      return this.router.navigate(['/category'], { 
        queryParams: { 
          dressCategory: this.activeDressCategory,
          fashionTab: this.activeFashionTab,
          sidebarCategory: this.activeSidebarCategories
        }
      });   
      // return this.router.navigate(['/category', this.activeFashionTab , this.selectedSidebarCategories, this.selectedDressCategory ]);
  }

}
