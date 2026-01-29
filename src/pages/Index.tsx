import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Truck, RefreshCw, Headphones } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/products/ProductCard';
import { mockProducts, mockCategories } from '@/data/mockData';

const features = [
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'On orders over $100',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Checkout',
    description: 'Stripe-ready payments',
  },
  {
    icon: RefreshCw,
    title: 'Easy Returns',
    description: '30-day return policy',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Always here to help',
  },
];

export default function Index() {
  const featuredProducts = mockProducts.filter(p => p.featured).slice(0, 4);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-accent/5 to-accent/10">
        <div className="page-container py-24 lg:py-32">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Enterprise E-commerce,{' '}
              <span className="text-accent">Simplified</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              A production-ready, scalable platform built for growth.
              Modern architecture, seamless UX, and enterprise-grade security.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button asChild size="xl" variant="accent">
                <Link to="/products">
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="xl" variant="secondary">
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
            <div className="mt-8 p-4 bg-card border rounded-lg inline-block">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Demo Credentials:</strong><br />
                Admin: admin@store.com / admin123<br />
                Customer: user@example.com / user123
              </p>
            </div>
          </div>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-accent/15 to-transparent hidden lg:block" />
      </section>

      {/* Features */}
      <section className="border-b bg-card">
        <div className="page-container py-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.title} className="flex items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-accent/10">
                  <feature.icon className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h4 className="text-sm font-medium">{feature.title}</h4>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="page-container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="section-title mb-0">Shop by Category</h2>
            <Button variant="ghost" asChild>
              <Link to="/products">View All</Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
            {mockCategories.map((category) => (
              <Link
                key={category.id}
                to={`/products?category=${category.slug}`}
                className="group flex flex-col items-center gap-3 p-6 rounded-xl border bg-card text-center transition-all duration-200 hover:border-accent hover:shadow-card-hover"
              >
                <span className="text-lg font-medium group-hover:text-accent transition-colors">
                  {category.name}
                </span>
                <span className="text-sm text-muted-foreground">
                  {category.productCount} products
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-muted/50">
        <div className="page-container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="section-title mb-0">Featured Products</h2>
            <Button variant="ghost" asChild>
              <Link to="/products?featured=true">View All</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-accent/10 via-accent/5 to-background">
        <div className="page-container text-center">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            Ready to Get Started?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of businesses using StorePro to power their e-commerce operations.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button asChild size="lg" variant="accent">
              <Link to="/products">Start Shopping</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
